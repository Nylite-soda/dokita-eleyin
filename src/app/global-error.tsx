'use client'

import Link from 'next/link'

export default function GlobalError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return <html lang="en"><body style={{ fontFamily: 'system-ui, sans-serif', padding: 40, color: '#1A3666', background: '#fff' }}>
    <main><h1>We couldn’t load the website.</h1><p>Please try again in a moment.</p><button onClick={unstable_retry}>Try again</button><p><Link href="/">Return home</Link></p></main>
  </body></html>
}
