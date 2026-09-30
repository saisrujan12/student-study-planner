function FilterBar({ filters, onFilterChange, subjects = [] }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="filter-bar" role="search" aria-label="Task filters">
      <div className="filter-group">
        <label htmlFor="filter-status" className="filter-label">Status</label>
        <select
          id="filter-status"
          name="completed"
          className="filter-select"
          value={filters.completed || ''}
          onChange={handleChange}
        >
          <option value="">All</option>
          <option value="false">Pending</option>
          <option value="true">Completed</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="filter-priority" className="filter-label">Priority</label>
        <select
          id="filter-priority"
          name="priority"
          className="filter-select"
          value={filters.priority || ''}
          onChange={handleChange}
        >
          <option value="">All</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="filter-subject" className="filter-label">Subject</label>
        <select
          id="filter-subject"
          name="subject"
          className="filter-select"
          value={filters.subject || ''}
          onChange={handleChange}
        >
          <option value="">All Subjects</option>
          {subjects.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="filter-sort" className="filter-label">Sort</label>
        <select
          id="filter-sort"
          name="sort"
          className="filter-select"
          value={filters.sort || 'deadline'}
          onChange={handleChange}
        >
          <option value="deadline">Deadline</option>
          <option value="newest">Newest</option>
          <option value="priority">Priority</option>
        </select>
      </div>
    </div>
  );
}

export default FilterBar;
