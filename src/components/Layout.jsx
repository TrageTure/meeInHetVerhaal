import React from 'react'
import { navItems } from '../data'

export function Header({ path, menuOpen, setMenuOpen }) {
  return (
    <header className="site-header">
      <div className="mobile-header">
        <a className="mobile-logo" href="/" aria-label="Mee in het verhaal" />
        <button className={`burger ${menuOpen ? 'is-open' : ''}`} type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu wisselen">
          <span />
          <span />
          <span />
        </button>
      </div>
      <nav className={`mobile-menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        {navItems.map((item) => (
          <a key={item.path} className={isActive(path, item.path) ? 'active' : ''} href={item.path}>
            {item.label}
          </a>
        ))}
      </nav>
      <div className="desktop-header">
        <nav className="desktop-nav">
          {navItems.map((item) => (
            <a key={item.path} className={isActive(path, item.path) ? 'active' : ''} href={item.path}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}

export function isActive(path, itemPath) {
  if (itemPath === '/') return path === '/'
  if (itemPath === '/blog/') return path === '/blog' || path.startsWith('/blog/')
  return path === itemPath
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-width footer-inner">
        <a className="footer-logo" href="/" aria-label="Mee in het verhaal">Mee in het verhaal</a>
        <div className="socials" aria-label="Sociale links">
          <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Bezoek onze Facebook-pagina"><SocialFacebook /></a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><SocialLinkedin /></a>
          <a href="https://instagram.com/meeinhetverhaal.be" target="_blank" rel="noreferrer" aria-label="Bezoek ons Instagram-profiel"><SocialInstagram /></a>
        </div>
        <p>Copyright © Alle rechten voorbehouden</p>
        <a className="footer-privacy-link" href="/privacy">Privacyverklaring</a>
      </div>
    </footer>
  )
}

export function SocialFacebook() {
  return <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#3c3c3c" /><path fill="#fff" d="M28.314 24.63l.572-3.741h-3.578V18.46c0-1.023.5-2.021 2.102-2.021h1.627v-3.186S27.561 13 26.149 13c-2.947 0-4.873 1.792-4.873 5.037v2.852H18v3.742h3.276v9.046a12.955 12.955 0 004.032 0v-9.046h3.006" /></svg>
}

export function SocialLinkedin() {
  return <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#3c3c3c" /><path fill="#fff" d="M21.525 19.511h4.165v2.132h.06c.58-1.038 1.998-2.132 4.111-2.132 4.397 0 5.21 2.733 5.21 6.287v7.238h-4.342V26.62c0-1.53-.031-3.499-2.258-3.499-2.261 0-2.606 1.667-2.606 3.388v6.528h-4.34V19.511zm-7.525 0h4.515v13.525H14zm4.515-3.757a2.256 2.256 0 01-2.257 2.254A2.256 2.256 0 0114 15.754a2.256 2.256 0 012.258-2.254 2.256 2.256 0 012.257 2.254z" /></svg>
}

export function SocialInstagram() {
  return <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#3c3c3c" /><path fill="#fff" d="M23.888 15.37c2.775 0 3.104.013 4.195.061 1.015.045 1.563.216 1.928.358.483.186.832.413 1.193.775.365.365.588.71.779 1.193.142.365.312.917.357 1.927.049 1.096.06 1.424.06 4.196 0 2.771-.011 3.104-.06 4.195-.045 1.015-.215 1.563-.357 1.928a3.212 3.212 0 01-.775 1.193c-.365.365-.71.588-1.193.779-.365.142-.917.312-1.927.357-1.096.049-1.425.06-4.196.06-2.772 0-3.104-.011-4.196-.06-1.014-.045-1.562-.215-1.927-.357a3.212 3.212 0 01-1.193-.775 3.255 3.255 0 01-.78-1.193c-.141-.365-.312-.917-.356-1.928-.05-1.095-.061-1.424-.061-4.195 0-2.772.012-3.104.06-4.196.045-1.014.216-1.562.358-1.927.186-.483.414-.832.775-1.193.365-.366.71-.589 1.193-.78.365-.141.917-.312 1.927-.357 1.092-.048 1.42-.06 4.196-.06zm0-1.87c-2.82 0-3.173.012-4.281.06-1.104.05-1.863.228-2.52.484a5.07 5.07 0 00-1.842 1.2 5.09 5.09 0 00-1.201 1.839c-.256.661-.434 1.416-.483 2.52-.049 1.112-.061 1.465-.061 4.285 0 2.82.012 3.173.06 4.28.05 1.104.228 1.863.484 2.52a5.07 5.07 0 001.2 1.843 5.078 5.078 0 001.839 1.197c.661.255 1.416.434 2.52.483 1.108.048 1.46.06 4.28.06 2.82 0 3.174-.012 4.282-.06 1.103-.05 1.862-.228 2.52-.483a5.078 5.078 0 001.838-1.197 5.078 5.078 0 001.197-1.838c.255-.662.434-1.417.483-2.52.048-1.108.06-1.461.06-4.281 0-2.82-.012-3.173-.06-4.281-.05-1.104-.228-1.863-.483-2.52a4.865 4.865 0 00-1.19-1.846 5.078 5.078 0 00-1.837-1.197c-.662-.256-1.417-.434-2.52-.483-1.112-.053-1.465-.065-4.285-.065z" /><path fill="#fff" d="M23.888 18.552a5.337 5.337 0 00-5.336 5.336 5.337 5.337 0 005.336 5.336 5.337 5.337 0 005.336-5.336 5.337 5.337 0 00-5.336-5.336zm0 8.797a3.462 3.462 0 110-6.923 3.462 3.462 0 010 6.923zm6.792-9.009a1.246 1.246 0 11-2.491 0 1.246 1.246 0 012.491 0z" /></svg>
}
