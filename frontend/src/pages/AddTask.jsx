import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import TaskForm from '../components/TaskForm';

function AddTask() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.createTask(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/tasks');
      }, 1000);
    } catch (err) {
      setError(err.data?.errors?.[0] || err.message || 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Add Study Task</h1>
        <p className="page-subtitle">Plan your next study session</p>
      </div>

      {success && (
        <div className="alert alert-success">
          Task created successfully! Redirecting to tasks...
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="form-container">
        <TaskForm
          onSubmit={handleSubmit}
          submitLabel="Create Task"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default AddTask;
