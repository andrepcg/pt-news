import Link from "next/link";
import { getAllTagsWithFrequency } from "../utils";

export const metadata = {
  title: "Notícias por Tag",
};

export default async function Page() {
  const tags = await getAllTagsWithFrequency();

  return (
    <div>
      <h1>Notícias por Tag</h1>
      <ul className="links">
        <li><a href="/">Home</a></li>
      </ul>

      <main>
        <div className="tag-list-container">
          {tags.map(({ tag, frequency }) => (
            <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`} className="tag-list-item">
              {tag} <span className="tag-frequency">({frequency})</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
