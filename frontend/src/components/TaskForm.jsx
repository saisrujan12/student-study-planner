import { useState, useEffect } from 'react';

function TaskForm({ initialData, onSubmit, submitLabel = 'Create Task', isLoading = false }) {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    estimatedMinutes: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        subject: initialData.subject || '',
        description: initialData.description || '',
        priority: initialData.priority || 'Medium',
        dueDate: initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().split('T')[0]
          : '',
        estimatedMinutes: initialData.estimatedMinutes || '',
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!['Low', 'Medium', 'High'].includes(formData.priority)) {
      newErrors.priority = 'Please select a valid priority';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    const minutes = Number(formData.estimatedMinutes);
    if (!formData.estimatedMinutes && formData.estimatedMinutes !== 0) {
      newErrors.estimatedMinutes = 'Estimated study time is required';
    } else if (isNaN(minutes) || minutes <= 0) {
      newErrors.estimatedMinutes = 'Study time must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...formData,
      estimatedMinutes: Number(formData.estimatedMinutes),
    });
  };

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="title" className="form-label">
          Task Title <span className="required">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          className={`form-input ${errors.title ? 'input-error' : ''}`}
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Binary Trees Revision"
          autoFocus
        />
        {errors.title && <span className="field-error">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="subject" className="form-label">
          Subject <span className="required">*</span>
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          className={`form-input ${errors.subject ? 'input-error' : ''}`}
          value={formData.subject}
          onChange={handleChange}
          placeholder="e.g., DSA"
        />
        {errors.subject && <span className="field-error">{errors.subject}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="priority" className="form-label">
            Priority <span className="required">*</span>
          </label>
          <select
            id="priority"
            name="priority"
            className={`form-input ${errors.priority ? 'input-error' : ''}`}
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          {errors.priority && <span className="field-error">{errors.priority}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="dueDate" className="form-label">
            Due Date <span className="required">*</span>
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            className={`form-input ${errors.dueDate ? 'input-error' : ''}`}
            value={formData.dueDate}
            onChange={handleChange}
          />
          {errors.dueDate && <span className="field-error">{errors.dueDate}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="estimatedMinutes" className="form-label">
          Estimated Study Time (minutes) <span className="required">*</span>
        </label>
        <input
          type="number"
          id="estimatedMinutes"
          name="estimatedMinutes"
          className={`form-input ${errors.estimatedMinutes ? 'input-error' : ''}`}
          value={formData.estimatedMinutes}
          onChange={handleChange}
          placeholder="e.g., 120"
          min="1"
        />
        {errors.estimatedMinutes && (
          <span className="field-error">{errors.estimatedMinutes}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className="form-input form-textarea"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add notes about what to study..."
          rows="4"
        />
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
        {isLoading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}

export default TaskForm;
