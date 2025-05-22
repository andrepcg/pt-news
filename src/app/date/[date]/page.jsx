import { promises as fs } from 'fs';

import Article from "../../components/Article";
import { listOfDates } from "../../utils";

// articles for date are stored in `articles/YYYY-MM-DD/*.json`
// Each article is composed of a title, tags, urls and date
// Merge all the files in the directory into a single object and remove any duplicates by title
async function loadArticles(date) {
  const path = `${process.cwd()}/articles/${date}`;
  let files;
  try {
    files = await fs.readdir(path);
  } catch (e) {
    console.error(e);
    return [];
  }
  const articles = [];
  const seenTitles = new Set();

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const content = await fs.readFile(`${path}/${file}`, 'utf8');

    const articles_file = JSON.parse(content);
    articles_file.forEach(article => {
      // Check if the article is already in the list
      if (!seenTitles.has(article.title)) {
        articles.push(article);
        seenTitles.add(article.title);
      }
    })
  }
  // sort articles by date
  return articles.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });
}

export default async function Page({ params }) {
  const { date } = await params;
  const articles = await loadArticles(date);

  if (articles.length === 0) {
    return <div>No articles found for {date}</div>;
  }

  return (
    <div>
      <h1>Notícias do dia {date}</h1>
      <br></br>
      <br></br>

      <main>
        {articles.map(article => <Article key={article.title} {...article} />)}
      </main>
    </div>
  );
}

export async function generateStaticParams() {
  const dates = await listOfDates();
  console.log(dates);

  return dates.map((d) => ({ date: d }))
}
