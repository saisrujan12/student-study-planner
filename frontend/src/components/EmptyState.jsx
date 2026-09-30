import { Link } from 'react-router-dom';

function EmptyState({ message = 'No tasks found.', actionLabel = 'Add Study Task', actionTo = '/tasks/new' }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">📝</div>
      <p className="empty-state-message">{message}</p>
      <Link to={actionTo} className="btn btn-primary">
        {actionLabel}
      </Link>
    </div>
  );
}

export default EmptyState;
