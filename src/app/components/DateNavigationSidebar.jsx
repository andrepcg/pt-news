function getMonthName(monthNum) {
  const date = new Date(2000, monthNum - 1, 1);
  return date.toLocaleDateString('pt-PT', { month: 'long' });
}

export default function DateNavigationSidebar({ groupedDates, showLinks = false }) {
  const years = Object.keys(groupedDates).sort((a, b) => b - a);

  return (
    <aside className="dates-sidebar">
      <nav aria-label="Navegação por ano">
        {years.map(year => {
          const months = Object.keys(groupedDates[year]).sort((a, b) => b - a);
          return (
            <div key={year} className="sidebar-year">
              {showLinks ? (
                <a href={`#year-${year}`} className="sidebar-year-link">
                  {year}
                </a>
              ) : (
                <div className="sidebar-year-link">
                  {year}
                </div>
              )}
              <div className="sidebar-months">
                {months.map(month => {
                  const monthData = groupedDates[year][month];
                  const count = monthData.count || (Array.isArray(monthData) ? monthData.length : 0);

                  return showLinks ? (
                    <a
                      key={month}
                      href={`#month-${year}-${month}`}
                      className="sidebar-month-link"
                    >
                      {getMonthName(month)}
                    </a>
                  ) : (
                    <div
                      key={month}
                      className="sidebar-month-link"
                    >
                      {getMonthName(month)} ({count})
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

