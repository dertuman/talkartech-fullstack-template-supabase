import { ImageResponse } from 'next/og';

import { siteConfig } from '@/lib/site';

export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: 80,
        background: '#0a0a0a',
        color: '#fafafa',
      }}
    >
      <div style={{ fontSize: 88, fontWeight: 700 }}>{siteConfig.name}</div>
      <div style={{ fontSize: 36, color: '#a3a3a3', marginTop: 16 }}>
        {siteConfig.description}
      </div>
    </div>,
    size
  );
}
