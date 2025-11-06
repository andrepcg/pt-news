import Link from "next/link";

import { listOfDates, loadArticles } from "../utils";

export const metadata = {
  title: "Notícias por data",
};

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'long',
  });
}

function getMonthName(monthNum) {
  const date = new Date(2000, monthNum - 1, 1);
  return date.toLocaleDateString('pt-PT', { month: 'long' });
}

function groupDatesByYearMonth(datesWithCounts) {
  const grouped = {};
  
  datesWithCounts.forEach(({ date, count }) => {
    const [year, month] = date.split('-');
    
    if (!grouped[year]) {
      grouped[year] = {};
    }
    if (!grouped[year][month]) {
      grouped[year][month] = [];
    }
    
    grouped[year][month].push({ date, count });
  });
  
  return grouped;
}

export default async function Page() {
  const dates = await listOfDates();
  
  // Get article counts for each date
  const datesWithCounts = await Promise.all(
    dates.map(async (date) => {
      const articles = await loadArticles(date);
      return { date, count: articles.length };
    })
  );

  // Reverse to show most recent first
  datesWithCounts.reverse();
  
  // Group dates by year and month
  const groupedDates = groupDatesByYearMonth(datesWithCounts);
  const years = Object.keys(groupedDates).sort((a, b) => b - a); // Sort years descending

  return (
    <div>
      <h1>Notícias por data</h1>
      <nav aria-label="Navegação">
        <ul className="links" style={{ marginBottom: '2rem' }}>
          <li><a href="/">Home</a></li>
        </ul>
      </nav>

      <div className="dates-layout">
        {/* Sidebar Navigation */}
        <aside className="dates-sidebar">
          <nav aria-label="Navegação por ano">
            {years.map(year => {
              const months = Object.keys(groupedDates[year]).sort((a, b) => b - a);
              return (
                <div key={year} className="sidebar-year">
                  <a href={`#year-${year}`} className="sidebar-year-link">
                    {year}
                  </a>
                  <div className="sidebar-months">
                    {months.map(month => (
                      <a 
                        key={month} 
                        href={`#month-${year}-${month}`}
                        className="sidebar-month-link"
                      >
                        {getMonthName(month)}
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="dates-main">
          {years.map(year => {
            const months = Object.keys(groupedDates[year]).sort((a, b) => b - a);
            
            return (
              <section key={year} id={`year-${year}`} className="year-section">
                <h2 className="year-heading">{year}</h2>
                
                {months.map(month => {
                  const datesInMonth = groupedDates[year][month];
                  
                  return (
                    <section key={month} id={`month-${year}-${month}`} className="month-section">
                      <h3 className="month-heading">{getMonthName(month)}</h3>
                      
                      <div className="tag-list-container">
                        {datesInMonth.map(({ date, count }) => (
                          <Link key={date} href={`/date/${date}`} className="tag-list-item">
                            <span>{formatDate(date)}</span>
                            <span className="tag-frequency">{count}</span>
                          </Link>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}