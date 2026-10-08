import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

export function GET() {
  return new ImageResponse(
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', height: '100%', background: '#1A3666', color: 'white', padding: '90px' }}>
      <div style={{ fontSize: 30, color: '#73F8FF', marginBottom: 30 }}>DENTAL HEALTH EDUCATION & OUTREACH</div>
      <div style={{ fontSize: 86, fontWeight: 700 }}>Dókítà Eléyín</div>
      <div style={{ fontSize: 36, marginTop: 35, maxWidth: 900 }}>Simple, accessible oral health knowledge for healthier communities.</div>
    </div>,
    { width: 1200, height: 630, headers: { 'Cache-Control': 'public, max-age=86400' } },
  )
}
