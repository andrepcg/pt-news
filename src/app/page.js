import Image from "next/image";
import { promises as fs } from 'fs';

import Article from "../components/Article";

function updatedAt(date) {
  return date.toLocaleString('pt-PT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).replace(',', '');
}

export default async function Home() {
  const file = await fs.readFile(process.cwd() + '/articles/latest.json', 'utf8');
  const data = JSON.parse(file);

  return (
    <div>
      <h1>Últimas Notícias</h1>
      <span>Actualizado às {updatedAt(new Date())}</span>
      <br></br>
      <br></br>

      <articles>
        {data.map(article => <Article key={article.title} {...article} />)}
      </articles>
    </div>
  );

}
