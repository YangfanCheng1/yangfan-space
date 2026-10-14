import { Link } from 'react-router-dom'

/**
 * Small, deliberately theme-neutral "home" chip that any app can drop in.
 * Uses inline styles so it looks the same no matter how the app is styled.
 */
export function BackToGateway() {
  return (
    <Link
      to="/"
      style={{
        position: 'fixed',
        left: 12,
        bottom: 12,
        zIndex: 50,
        padding: '6px 10px',
        font: '700 12px/1 "Space Mono", ui-monospace, monospace',
        textTransform: 'uppercase',
        color: '#f8f6f0',
        background: '#1e1e24',
        border: '2px solid #f8f6f0',
        textDecoration: 'none',
      }}
    >
      ← Yangfan's Space
    </Link>
  )
}
