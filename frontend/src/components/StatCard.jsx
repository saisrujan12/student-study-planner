function StatCard({ label, value, icon, variant = '' }) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-icon" aria-hidden="true">{icon}</div>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}

export default StatCard;
