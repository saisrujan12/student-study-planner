const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

// We need to set up the in-memory DB before requiring the app
let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGO_URI = mongoUri;
  process.env.NODE_ENV = 'test';

  await mongoose.connect(mongoUri);

  // Require app after setting env
  const server = require('../server');
  app = server.app;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clean up between tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('StudyFlow API', () => {
  const validTask = {
    title: 'Binary Trees Revision',
    subject: 'DSA',
    description: 'Revise traversals and solve five practice problems.',
    priority: 'High',
    dueDate: '2026-10-15',
    estimatedMinutes: 120,
  };

  // ==================== HEALTH CHECK ====================
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('StudyFlow API is running');
    });
  });

  // ==================== CREATE TASK ====================
  describe('POST /api/tasks', () => {
    it('should create a valid task', async () => {
      const res = await request(app).post('/api/tasks').send(validTask);
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Binary Trees Revision');
      expect(res.body.data.subject).toBe('DSA');
      expect(res.body.data.priority).toBe('High');
      expect(res.body.data.completed).toBe(false);
      expect(res.body.data.completedAt).toBeNull();
    });

    it('should reject empty title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ ...validTask, title: '' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject whitespace-only title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ ...validTask, title: '   ' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject single character title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ ...validTask, title: 'A' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject missing subject', async () => {
      const { subject, ...noSubject } = validTask;
      const res = await request(app).post('/api/tasks').send(noSubject);
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid priority', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ ...validTask, priority: 'Urgent' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject zero estimatedMinutes', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ ...validTask, estimatedMinutes: 0 });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject negative estimatedMinutes', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ ...validTask, estimatedMinutes: -20 });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject missing dueDate', async () => {
      const { dueDate, ...noDueDate } = validTask;
      const res = await request(app).post('/api/tasks').send(noDueDate);
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject missing required fields', async () => {
      const res = await request(app).post('/api/tasks').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should use default priority when not specified', async () => {
      const { priority, ...noPriority } = validTask;
      const res = await request(app).post('/api/tasks').send(noPriority);
      expect(res.statusCode).toBe(201);
      expect(res.body.data.priority).toBe('Medium');
    });
  });

  // ==================== GET TASKS ====================
  describe('GET /api/tasks', () => {
    it('should return empty array when no tasks', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    it('should return all tasks', async () => {
      await request(app).post('/api/tasks').send(validTask);
      await request(app)
        .post('/api/tasks')
        .send({ ...validTask, title: 'OS Concepts', subject: 'OS', priority: 'Low' });

      const res = await request(app).get('/api/tasks');
      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(2);
    });

    it('should filter by priority', async () => {
      await request(app).post('/api/tasks').send(validTask);
      await request(app)
        .post('/api/tasks')
        .send({ ...validTask, title: 'OS Concepts', priority: 'Low' });

      const res = await request(app).get('/api/tasks?priority=High');
      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].priority).toBe('High');
    });

    it('should filter by subject', async () => {
      await request(app).post('/api/tasks').send(validTask);
      await request(app)
        .post('/api/tasks')
        .send({ ...validTask, title: 'OS Concepts', subject: 'OS' });

      const res = await request(app).get('/api/tasks?subject=DSA');
      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].subject).toBe('DSA');
    });

    it('should filter by completed', async () => {
      await request(app).post('/api/tasks').send(validTask);

      const res = await request(app).get('/api/tasks?completed=false');
      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].completed).toBe(false);
    });

    it('should return empty for filters with no match', async () => {
      await request(app).post('/api/tasks').send(validTask);

      const res = await request(app).get('/api/tasks?subject=NonExistent');
      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(0);
    });

    it('should support combined filters', async () => {
      await request(app).post('/api/tasks').send(validTask);
      await request(app)
        .post('/api/tasks')
        .send({ ...validTask, title: 'DSA Easy', priority: 'Low' });

      const res = await request(app).get('/api/tasks?subject=DSA&priority=High&completed=false');
      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(1);
    });
  });

  // ==================== GET SINGLE TASK ====================
  describe('GET /api/tasks/:id', () => {
    it('should return a task by ID', async () => {
      const createRes = await request(app).post('/api/tasks').send(validTask);
      const id = createRes.body.data._id;

      const res = await request(app).get(`/api/tasks/${id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.title).toBe('Binary Trees Revision');
    });

    it('should return 404 for nonexistent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/tasks/${fakeId}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for malformed ID', async () => {
      const res = await request(app).get('/api/tasks/not-a-valid-id');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ==================== UPDATE TASK ====================
  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      const createRes = await request(app).post('/api/tasks').send(validTask);
      const id = createRes.body.data._id;

      const res = await request(app)
        .put(`/api/tasks/${id}`)
        .send({ title: 'Updated Title', estimatedMinutes: 90 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.title).toBe('Updated Title');
      expect(res.body.data.estimatedMinutes).toBe(90);
    });

    it('should return 404 for nonexistent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/tasks/${fakeId}`)
        .send({ title: 'Updated' });
      expect(res.statusCode).toBe(404);
    });

    it('should clear completedAt when reopening task', async () => {
      const createRes = await request(app).post('/api/tasks').send(validTask);
      const id = createRes.body.data._id;

      // Complete it
      await request(app).put(`/api/tasks/${id}/complete`);

      // Reopen via update
      const res = await request(app)
        .put(`/api/tasks/${id}`)
        .send({ completed: false });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.completed).toBe(false);
      expect(res.body.data.completedAt).toBeNull();
    });
  });

  // ==================== COMPLETE TASK ====================
  describe('PUT /api/tasks/:id/complete', () => {
    it('should mark a task as complete', async () => {
      const createRes = await request(app).post('/api/tasks').send(validTask);
      const id = createRes.body.data._id;

      const res = await request(app).put(`/api/tasks/${id}/complete`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.completed).toBe(true);
      expect(res.body.data.completedAt).not.toBeNull();
    });

    it('should toggle (reopen) an already completed task', async () => {
      const createRes = await request(app).post('/api/tasks').send(validTask);
      const id = createRes.body.data._id;

      // Complete
      await request(app).put(`/api/tasks/${id}/complete`);
      // Toggle back
      const res = await request(app).put(`/api/tasks/${id}/complete`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.completed).toBe(false);
      expect(res.body.data.completedAt).toBeNull();
    });

    it('should return 404 for nonexistent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).put(`/api/tasks/${fakeId}/complete`);
      expect(res.statusCode).toBe(404);
    });

    it('should return 400 for malformed ID', async () => {
      const res = await request(app).put('/api/tasks/invalid-id/complete');
      expect(res.statusCode).toBe(400);
    });
  });

  // ==================== DELETE TASK ====================
  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const createRes = await request(app).post('/api/tasks').send(validTask);
      const id = createRes.body.data._id;

      const res = await request(app).delete(`/api/tasks/${id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify it's gone
      const getRes = await request(app).get(`/api/tasks/${id}`);
      expect(getRes.statusCode).toBe(404);
    });

    it('should return 404 for nonexistent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/tasks/${fakeId}`);
      expect(res.statusCode).toBe(404);
    });

    it('should return 400 for malformed ID', async () => {
      const res = await request(app).delete('/api/tasks/bad-id');
      expect(res.statusCode).toBe(400);
    });
  });

  // ==================== 404 ROUTES ====================
  describe('Unknown API routes', () => {
    it('should return 404 for unknown API path', async () => {
      const res = await request(app).get('/api/nonexistent');
      expect(res.statusCode).toBe(404);
    });
  });
});
