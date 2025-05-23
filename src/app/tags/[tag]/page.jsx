import Article from "../../components/Article";
import { getArticlesByTag, getAllTagsWithFrequency } from "../../utils";

export default async function Page({ params }) {
  const { tag } = await params;
  const articles = await getArticlesByTag(decodeURIComponent(tag));

  if (articles.length === 0) {
    return <div>No articles found for tag {decodeURIComponent(tag)}</div>;
  }

  return (
    <div>
      <h1>Notícias com a tag: {decodeURIComponent(tag)}</h1>
      <ul className="links">
        <li><a href="/">Home</a></li>
        <li><a href="/tags">Todas as Tags</a></li>
      </ul>
      <br></br>
      <br></br>

      <main>
        {articles.map(article => <Article key={article.title} {...article} />)}
      </main>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const { tag } = await params;
  return {
    title: `Notícias com a tag: ${decodeURIComponent(tag)}`,
  };
}

export async function generateStaticParams() {
  const tags = await getAllTagsWithFrequency();
  return tags.map(t => ({ tag: encodeURIComponent(t.tag) }));
}
