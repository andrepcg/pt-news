import Link from 'next/link'

export default function Tag({ tag }) {
  return (
    <Link href={`/tags/${tag}`}>
      <span >{tag}</span>
    </Link>
  )
}
