import { promises as fs } from 'fs';

import Article from "../../components/Article";
import Summary from '@/app/components/Summary';
import { listOfDates, loadArticles, getSummary } from "../../utils";

export default async function Page({ params }) {
  const { date } = await params;
  const articles = await loadArticles(date);
  const summary = await getSummary(date);

  if (articles.length === 0) {
    return <div>No articles found for {date}</div>;
  }

  return (
    <div>
      <h1>Notícias do dia {date}</h1>
      <ul className="links">
        <li><a href="/">Home</a></li>
      </ul>
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
