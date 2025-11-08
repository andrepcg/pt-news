import Link from "next/link";

import { listOfDates, loadArticles } from "../utils";
import DateNavigationSidebar from "../components/DateNavigationSidebar";
import { formatDate, getMonthName, groupDatesByYearMonth } from "../dateUtils";

export const metadata = {
  title: "Diurna.pt - Notícias por data",
};

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
          <li><Link href="/">Home</Link></li>
          <li><Link href="/tags">Notícias por tag</Link></li>
        </ul>
      </nav>

      <div className="dates-layout">
        {/* Sidebar Navigation */}
        <DateNavigationSidebar groupedDates={groupedDates} showLinks={true} />

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