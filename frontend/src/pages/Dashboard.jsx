import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatCard from '../components/StatCard';
import TaskCard from '../components/TaskCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { isToday, daysUntilDue } from '../utils/helpers';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTasks();
      setTasks(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleComplete = async (id) => {
    try {
      await api.completeTask(id);
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteTask(id);
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <LoadingState message="Loading your study plan..." />;

  if (error) {
    return (
      <div className="error-state">
        <p className="error-message">Could not load your tasks: {error}</p>
        <button className="btn btn-primary" onClick={fetchTasks}>
          Retry
        </button>
      </div>
    );
  }

  // Calculate stats
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const highPriority = pendingTasks.filter((t) => t.priority === 'High');
  const totalMinutes = pendingTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);

  // Today's tasks and upcoming
  const todayTasks = pendingTasks.filter((t) => {
    const days = daysUntilDue(t.dueDate);
    return days !== null && days <= 0;
  });

  const upcomingTasks = pendingTasks
    .filter((t) => {
      const days = daysUntilDue(t.dueDate);
      return days !== null && days > 0;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  if (tasks.length === 0) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome to StudyFlow</p>
        </div>
        <EmptyState
          message="No study tasks yet. Create your first task to start planning."
          actionLabel="Add Study Task"
          actionTo="/tasks/new"
        />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Your study overview</p>
      </div>

      <div className="stats-grid">
        <StatCard label="Pending Tasks" value={pendingTasks.length} icon="📋" variant="stat-pending" />
        <StatCard label="Completed" value={completedTasks.length} icon="✅" variant="stat-completed" />
        <StatCard label="High Priority" value={highPriority.length} icon="🔴" variant="stat-high" />
        <StatCard label="Study Minutes" value={totalMinutes} icon="⏱️" variant="stat-time" />
      </div>

      {/* Today's Study Plan */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">
            {todayTasks.length > 0 ? "Today's Study Plan" : 'Due & Overdue'}
          </h2>
          <Link to="/tasks" className="section-link">View All Tasks</Link>
        </div>

        {todayTasks.length === 0 ? (
          <div className="section-empty">
            <p>No tasks due today. Great job staying ahead!</p>
          </div>
        ) : (
          <div className="task-grid">
            {todayTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onComplete={handleComplete}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming */}
      {upcomingTasks.length > 0 && (
        <section className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Upcoming Tasks</h2>
          </div>
          <div className="task-grid">
            {upcomingTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onComplete={handleComplete}
                onDelete={handleDelete}
                compact
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Dashboard;
