import { promises as fs } from 'fs';

import Article from "../../components/Article";
import Summary from '@/app/components/Summary';
import { listOfDates, loadArticles, getSummary } from "../../utils";
import Link from 'next/link'; // Import Link

export default async function Page({ params }) {
  const { date } = await params;
  const articles = await loadArticles(date);
  const summary = await getSummary(date);

  if (articles.length === 0) {
    return <div>No articles found for {date}</div>;
  }

  const allDates = await listOfDates(); // Fetch all dates
  allDates.sort((a, b) => new Date(a) - new Date(b)); // Ensure dates are sorted

  const currentIndex = allDates.indexOf(date);
  const prevDate = currentIndex > 0 ? allDates[currentIndex - 1] : null;
  const nextDate = currentIndex < allDates.length - 1 ? allDates[currentIndex + 1] : null;

  return (
    <div>
      <h1>Notícias do dia {date}</h1>
      <ul className="links">
        <li><a href="/">Home</a></li>
      </ul>
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0' }}>
        {prevDate ? (
          <Link href={`/date/${prevDate}`}>&larr; Dia Anterior ({prevDate})</Link>
        ) : (
          <span>&nbsp;</span> // Placeholder for alignment
        )}
        {nextDate ? (
          <Link href={`/date/${nextDate}`}>Próximo Dia ({nextDate}) &rarr;</Link>
        ) : (
          <span>&nbsp;</span> // Placeholder for alignment
        )}
      </div>
      <Summary summary={summary} title="Resumo" />
      <br></br>
      <br></br>

      <main>
        {articles.map(article => <Article key={article.title} {...article} />)}
      </main>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const { date } = await params

  return {
    title: `Notícias do dia ${date}`,
  }
}

export async function generateStaticParams() {
  const dates = await listOfDates();

  return dates.map((d) => ({ date: d }))
}
