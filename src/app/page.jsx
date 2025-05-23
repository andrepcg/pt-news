import { promises as fs } from 'fs';

import { getSummary } from "./utils";

import Article from "./components/Article";
import UpdatedAt from "./components/UpdatedAt";
import Summary from './components/Summary';

function getDate() {
  const isoString = new Date().toISOString();
  return isoString.split("T")[0];
}

export default async function Home() {
  const file = await fs.readFile(process.cwd() + '/articles/latest.json', 'utf8');
  const data = JSON.parse(file);
  const summary = await getSummary(getDate());

  return (
    <div>
      <h1 id="page-title">Últimas Notícias</h1>
      <UpdatedAt date={new Date()}/>

      <nav aria-label="Navegação secundária">
        <ul className="links" style={{ marginBottom: '2rem' }}>
          <li><a href="/date">Notícias por data</a></li>
        </ul>
      </nav>

      <Summary summary={summary} />
      <br></br>

      <main aria-labelledby="page-title">
        {data.map(article => <Article key={article.title} {...article} />)}
      </main>
    </div>
  );

}
