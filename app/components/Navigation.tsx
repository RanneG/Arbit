'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './styles/Navigation.css'

export default function Navigation() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || (path === '/gallery' && pathname?.startsWith('/card'))
  }

  return (
    <nav className="top-nav">
      <Link href="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
        <span className="nav-icon">🏠</span>
        <span className="nav-label">Home</span>
      </Link>
      <Link href="/trading" className={`nav-item ${isActive('/trading') ? 'active' : ''}`}>
        <span className="nav-icon">📈</span>
        <span className="nav-label">Trading</span>
      </Link>
      <Link href="/portfolio" className={`nav-item ${isActive('/portfolio') ? 'active' : ''}`}>
        <span className="nav-icon">💼</span>
        <span className="nav-label">Portfolio</span>
      </Link>
      <Link href="/collection" className={`nav-item ${isActive('/collection') ? 'active' : ''}`}>
        <span className="nav-icon">📚</span>
        <span className="nav-label">Collection</span>
      </Link>
      <Link href="/help" className={`nav-item ${isActive('/help') ? 'active' : ''}`}>
        <span className="nav-icon">❓</span>
        <span className="nav-label">Help</span>
      </Link>
    </nav>
  )
}
