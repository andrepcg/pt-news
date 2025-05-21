
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
    <article>
      <h2>{title}</h2>
      <p className='meta'>
        <span>{formatDate(date)}</span>
        {' · '}
        <span className='tags'>
          {tags.map(t => (<span key={t}>{t}</span>))}
        </span>
      </p>
      <ul className='links'>
        {urls.map(url => (<li key={url}><Link href={url}>{extractHost(url)}</Link></li>))}
      </ul>
    </article>
  )
}