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
  const urlObj = new URL(url)
  return urlObj.hostname.replace('www.', '')
}

export default function Article({ title, tags, urls, date }) {
  return (
    <article itemScope itemType="http://schema.org/NewsArticle">
      <h2 itemProp="headline">{title}</h2>
      <p className='meta'>
        <time itemProp="datePublished" dateTime={date}>{formatDate(date)}</time>
        {' · '}
        <span className='tags' itemProp="keywords">
          {tags.map(t => (<span key={t}>{t}</span>))}
        </span>
      </p>
      <ul className='links'>
        {urls.map(url => (<li key={url}><Link href={url} itemProp="url">{extractHost(url)}</Link></li>))}
      </ul>
    </article>
  )
}