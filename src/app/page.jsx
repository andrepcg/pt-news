import { promises as fs } from 'fs';

import Article from "./components/Article";
import UpdatedAt from "./components/UpdatedAt";

export default async function Home() {
  const file = await fs.readFile(process.cwd() + '/articles/latest.json', 'utf8');
  const data = JSON.parse(file);

  return (
    <div>
      <h1>Últimas Notícias</h1>
      <UpdatedAt date={new Date()}/>
      <br></br>
      <br></br>

      <main>
        {data.map(article => <Article key={article.title} {...article} />)}
      </main>
    </div>
  );

}
