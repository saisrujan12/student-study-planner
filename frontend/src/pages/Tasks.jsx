import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import TaskCard from '../components/TaskCard';
import FilterBar from '../components/FilterBar';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    completed: '',
    priority: '',
    subject: '',
    sort: 'deadline',
  });

  // Get unique subjects from ALL tasks (not filtered)
  const subjects = useMemo(() => {
    const unique = [...new Set(allTasks.map((t) => t.subject))].sort();
    return unique;
  }, [allTasks]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all tasks first (for subjects list)
      const allData = await api.getTasks();
      setAllTasks(allData.data);

      // Fetch filtered tasks
      const filteredData = await api.getTasks(filters);
      setTasks(filteredData.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters]);

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

  if (loading) return <LoadingState message="Loading tasks..." />;

  if (error) {
    return (
      <div className="error-state">
        <p className="error-message">Could not load tasks: {error}</p>
        <button className="btn btn-primary" onClick={fetchTasks}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Study Tasks</h1>
        <p className="page-subtitle">
          {allTasks.length === 0
            ? 'No tasks yet'
            : `${allTasks.filter((t) => !t.completed).length} pending · ${allTasks.filter((t) => t.completed).length} completed`}
        </p>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        subjects={subjects}
      />

      {tasks.length === 0 ? (
        allTasks.length === 0 ? (
          <EmptyState
            message="No study tasks yet. Create your first task to start planning."
            actionLabel="Add Study Task"
            actionTo="/tasks/new"
          />
        ) : (
          <EmptyState
            message="No tasks match your filters. Try adjusting the filters above."
            actionLabel="Clear Filters"
            actionTo="/tasks"
          />
        )
      ) : (
        <div className="task-grid">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onComplete={handleComplete}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Tasks;
