import Link from 'next/link'

function formatDate(date) {
  return new Date(date).toLocaleString('pt-PT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Lisbon',
  })
}

function extractHost(url) {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch (e) {
    console.error(`Error extracting host from ${url}: ${e}`)
    return url
  }
}

export default function Article({ title, tags = [], urls = [], date }) {
  // Ensure `tags` and `urls` are arrays to avoid runtime errors when using `.map`.
  const tagsArray = Array.isArray(tags) ? tags : (tags ? [tags] : []);
  const urlsArray = (Array.isArray(urls) ? urls : (urls ? [urls] : [])).filter((u) => typeof u === 'string' && u.trim().length > 0);

  return (
    <article itemScope itemType="http://schema.org/NewsArticle">
      <h2 itemProp="headline">{title}</h2>
      <p className='meta'>
        <time itemProp="datePublished" dateTime={date}>{formatDate(date)}</time>
        {' · '}
        <span className='tags' itemProp="keywords">
          {tagsArray.map((t) => (
            <Link key={t} href={`/tags/${t}`}>
              <span>{t}</span>
            </Link>
          ))}
        </span>
      </p>
      <ul className='links'>
        {urlsArray.map((url) => (
          <li key={url}>
            <Link href={url} itemProp="url">
              {extractHost(url)}
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}