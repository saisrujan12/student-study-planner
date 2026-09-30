import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { formatMinutes } from '../utils/helpers';

function Progress() {
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

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalMinutes = tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
    const completedMinutes = tasks
      .filter((t) => t.completed)
      .reduce((sum, t) => sum + t.estimatedMinutes, 0);

    // Subject breakdown
    const subjectMap = {};
    tasks.forEach((t) => {
      if (!subjectMap[t.subject]) {
        subjectMap[t.subject] = { total: 0, completed: 0, minutes: 0, completedMinutes: 0 };
      }
      subjectMap[t.subject].total++;
      subjectMap[t.subject].minutes += t.estimatedMinutes;
      if (t.completed) {
        subjectMap[t.subject].completed++;
        subjectMap[t.subject].completedMinutes += t.estimatedMinutes;
      }
    });

    const subjects = Object.entries(subjectMap)
      .map(([name, data]) => ({
        name,
        ...data,
        percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    return { total, completed, pending, percentage, totalMinutes, completedMinutes, subjects };
  }, [tasks]);

  if (loading) return <LoadingState message="Calculating progress..." />;

  if (error) {
    return (
      <div className="error-state">
        <p className="error-message">Could not load progress data: {error}</p>
        <button className="btn btn-primary" onClick={fetchTasks}>
          Retry
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Study Progress</h1>
          <p className="page-subtitle">Track your academic progress</p>
        </div>
        <EmptyState
          message="No tasks to analyze yet. Create some tasks to see your progress."
          actionLabel="Add Study Task"
          actionTo="/tasks/new"
        />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Study Progress</h1>
        <p className="page-subtitle">Your academic progress at a glance</p>
      </div>

      {/* Overall progress */}
      <div className="progress-overview">
        <div className="progress-ring-container">
          <div className="progress-ring">
            <svg viewBox="0 0 120 120" className="progress-svg">
              <circle
                cx="60"
                cy="60"
                r="52"
                className="progress-track"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                className="progress-fill"
                style={{
                  strokeDasharray: `${2 * Math.PI * 52}`,
                  strokeDashoffset: `${2 * Math.PI * 52 * (1 - stats.percentage / 100)}`,
                }}
              />
            </svg>
            <div className="progress-ring-label">
              <span className="progress-percentage">{stats.percentage}%</span>
              <span className="progress-text">Complete</span>
            </div>
          </div>
        </div>

        <div className="progress-stats">
          <div className="progress-stat-item">
            <span className="progress-stat-value">{stats.total}</span>
            <span className="progress-stat-label">Total Tasks</span>
          </div>
          <div className="progress-stat-item">
            <span className="progress-stat-value">{stats.completed}</span>
            <span className="progress-stat-label">Completed</span>
          </div>
          <div className="progress-stat-item">
            <span className="progress-stat-value">{stats.pending}</span>
            <span className="progress-stat-label">Pending</span>
          </div>
          <div className="progress-stat-item">
            <span className="progress-stat-value">{formatMinutes(stats.totalMinutes)}</span>
            <span className="progress-stat-label">Total Planned</span>
          </div>
          <div className="progress-stat-item">
            <span className="progress-stat-value">{formatMinutes(stats.completedMinutes)}</span>
            <span className="progress-stat-label">Completed Time</span>
          </div>
        </div>
      </div>

      {/* Subject Breakdown */}
      <section className="progress-section">
        <h2 className="section-title">Progress by Subject</h2>
        <div className="subject-list">
          {stats.subjects.map((subject) => (
            <div key={subject.name} className="subject-item">
              <div className="subject-header">
                <span className="subject-name">{subject.name}</span>
                <span className="subject-count">
                  {subject.completed}/{subject.total} tasks · {formatMinutes(subject.minutes)}
                </span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${subject.percentage}%` }}
                  role="progressbar"
                  aria-valuenow={subject.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${subject.name}: ${subject.percentage}% complete`}
                >
                  {subject.percentage > 10 && (
                    <span className="progress-bar-label">{subject.percentage}%</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Progress;
