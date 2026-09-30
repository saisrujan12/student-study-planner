import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import TaskForm from '../components/TaskForm';
import LoadingState from '../components/LoadingState';

function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const data = await api.getTask(id);
        setTask(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await api.updateTask(id, formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/tasks');
      }, 1000);
    } catch (err) {
      setSubmitError(err.data?.errors?.[0] || err.message || 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading task..." />;

  if (error) {
    return (
      <div className="page">
        <div className="error-state">
          <p className="error-message">{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/tasks')}>
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Edit Task</h1>
        <p className="page-subtitle">Update your study task</p>
      </div>

      {success && (
        <div className="alert alert-success">
          Task updated successfully! Redirecting...
        </div>
      )}

      {submitError && (
        <div className="alert alert-error">
          {submitError}
        </div>
      )}

      <div className="form-container">
        <TaskForm
          initialData={task}
          onSubmit={handleSubmit}
          submitLabel="Update Task"
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}

export default EditTask;
