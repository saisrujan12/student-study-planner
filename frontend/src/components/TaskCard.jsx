import { Link } from 'react-router-dom';
import { formatDate, formatMinutes, getPriorityClass, isOverdue, daysUntilDue } from '../utils/helpers';

function TaskCard({ task, onComplete, onDelete, compact = false }) {
  const overdue = !task.completed && isOverdue(task.dueDate);
  const days = daysUntilDue(task.dueDate);

  const getDueLabel = () => {
    if (task.completed) return 'Completed';
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    if (days < 0) return `${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''} overdue`;
    return `${days} day${days > 1 ? 's' : ''} left`;
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
      onDelete(task._id);
    }
  };

  return (
    <article className={`task-card ${task.completed ? 'completed' : ''} ${overdue ? 'overdue' : ''}`}>
      <div className="task-card-header">
        <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
          {task.priority}
        </span>
        <span className={`due-label ${overdue ? 'overdue' : ''} ${days === 0 ? 'today' : ''}`}>
          {getDueLabel()}
        </span>
      </div>

      <h3 className={`task-card-title ${task.completed ? 'line-through' : ''}`}>
        {task.title}
      </h3>

      <div className="task-card-meta">
        <span className="task-subject">{task.subject}</span>
        <span className="task-time">{formatMinutes(task.estimatedMinutes)}</span>
        <span className="task-date">{formatDate(task.dueDate)}</span>
      </div>

      {!compact && task.description && (
        <p className="task-card-desc">
          {task.description.length > 120
            ? task.description.substring(0, 120) + '...'
            : task.description}
        </p>
      )}

      <div className="task-card-actions">
        <button
          className={`btn btn-sm ${task.completed ? 'btn-outline' : 'btn-success'}`}
          onClick={() => onComplete(task._id)}
          aria-label={task.completed ? 'Reopen task' : 'Complete task'}
        >
          {task.completed ? 'Reopen' : 'Complete'}
        </button>

        <Link
          to={`/tasks/${task._id}/edit`}
          className="btn btn-sm btn-outline"
          aria-label={`Edit ${task.title}`}
        >
          Edit
        </Link>

        <button
          className="btn btn-sm btn-danger"
          onClick={handleDelete}
          aria-label={`Delete ${task.title}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default TaskCard;
