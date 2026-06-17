import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Blog', path: '/blog/' },
  { label: 'Over Jorane', path: '/over-jorane' },
  { label: 'Contact', path: '/contact' },
]

const categories = [
  { label: 'Alle berichten', path: '/blog/' },
  { label: 'Voor zorgfiguren', path: '/blog/voor-zorgfiguren/' },
  { label: 'Voor leerkrachten', path: '/blog/voor-leerkrachten/' },
  { label: 'Voor zorgverleners', path: '/blog/voor-zorgverleners/' },
]

const posts = [
  {
    title: 'Blog voor zorgverleners',
    category: 'Voor zorgverleners',
    categoryPath: '/blog/voor-zorgverleners/',
    path: '/blog/blog-voor-zorgverleners',
    image: '/assets/blog-voor-zorgverleners.png',
    foregroundImage: '/assets/zorgverleners.png',
    foregroundClass: 'foreground-zorgverleners',
    age: ['6-9 jaar', '9-12 jaar'],
    theme: ['ernstig ziek', 'ongeneeslijk ziek'],
    goal: ['samen begrijpen', 'samen voelen'],
    intro: 'Een korte testblog voor zorgverleners over hoe je moeilijke informatie rustig en helder kunt aanbieden aan kinderen en hun omgeving.',
  },
  {
    title: 'Blog voor leerkrachten',
    category: 'Voor leerkrachten',
    categoryPath: '/blog/voor-leerkrachten/',
    path: '/blog/blog-voor-leerkrachten',
    image: '/assets/blog-voor-leerkrachten.png',
    foregroundImage: '/assets/leerkrachten.png',
    foregroundClass: 'foreground-leerkrachten',
    age: ['3-5 jaar', '6-9 jaar', '9-12 jaar'],
    theme: ['afscheid en rouw'],
    goal: ['samen begrijpen', 'samen doen'],
    intro: 'Een testblog voor leerkrachten met handvatten om ruimte te maken voor vragen, stilte en gesprek in de klas.',
  },
  {
    title: 'Blog voor zorgfiguren',
    category: 'Voor zorgfiguren',
    categoryPath: '/blog/voor-zorgfiguren/',
    path: '/blog/blog-voor-zorgfiguren',
    image: '/assets/blog-voor-zorgfiguren.png',
    foregroundImage: '/assets/zorgfiguren.png',
    foregroundClass: 'foreground-zorgfiguren',
    age: ['0-2 jaar', '3-5 jaar', '6-9 jaar'],
    theme: ['ernstig ziek', 'ongeneeslijk ziek', 'afscheid en rouw'],
    goal: ['samen begrijpen', 'samen voelen', 'samen doen'],
    intro: 'Een testblog voor zorgfiguren over nabij blijven, woorden zoeken en samen kleine momenten van betekenis maken.',
  },
  {
    title: 'Wanneer woorden moeilijk zijn',
    category: 'Voor zorgfiguren',
    categoryPath: '/blog/voor-zorgfiguren/',
    path: '/blog/wanneer-woorden-moeilijk-zijn',
    image: '/assets/blog-voor-zorgfiguren.png',
    foregroundImage: '/assets/zorgfiguren.png',
    foregroundClass: 'foreground-zorgfiguren',
    age: ['3-5 jaar', '6-9 jaar'],
    theme: ['ernstig ziek'],
    goal: ['samen voelen', 'samen begrijpen'],
    intro: 'Soms zijn er geen perfecte woorden. Deze testblog verkent hoe nabijheid, eenvoud en herhaling toch veiligheid kunnen geven.',
  },
  {
    title: 'Een rustig afscheidsmoment maken',
    category: 'Voor zorgfiguren',
    categoryPath: '/blog/voor-zorgfiguren/',
    path: '/blog/een-rustig-afscheidsmoment-maken',
    image: '/assets/blog-voor-zorgfiguren.png',
    foregroundImage: '/assets/zorgfiguren.png',
    foregroundClass: 'foreground-zorgfiguren',
    age: ['0-2 jaar', '3-5 jaar'],
    theme: ['afscheid en rouw'],
    goal: ['samen voelen', 'samen doen'],
    intro: 'Een testblog over zachte rituelen, voorspelbaarheid en kleine handelingen die een afscheid tastbaar kunnen maken.',
  },
  {
    title: 'Praten in de klas over ziekte',
    category: 'Voor leerkrachten',
    categoryPath: '/blog/voor-leerkrachten/',
    path: '/blog/praten-in-de-klas-over-ziekte',
    image: '/assets/blog-voor-leerkrachten.png',
    foregroundImage: '/assets/leerkrachten.png',
    foregroundClass: 'foreground-leerkrachten',
    age: ['6-9 jaar', '9-12 jaar'],
    theme: ['ernstig ziek'],
    goal: ['samen begrijpen'],
    intro: 'Deze testblog laat zien hoe je als leerkracht ziekte bespreekbaar kunt maken zonder de klas te overspoelen.',
  },
  {
    title: 'Rituelen die kinderen houvast geven',
    category: 'Voor leerkrachten',
    categoryPath: '/blog/voor-leerkrachten/',
    path: '/blog/rituelen-die-kinderen-houvast-geven',
    image: '/assets/blog-voor-leerkrachten.png',
    foregroundImage: '/assets/leerkrachten.png',
    foregroundClass: 'foreground-leerkrachten',
    age: ['3-5 jaar', '6-9 jaar'],
    theme: ['afscheid en rouw'],
    goal: ['samen doen', 'samen voelen'],
    intro: 'Een testblog over klasrituelen die kinderen helpen om gevoelens te delen en samen houvast te vinden.',
  },
  {
    title: 'Uitleg geven zonder te overspoelen',
    category: 'Voor zorgverleners',
    categoryPath: '/blog/voor-zorgverleners/',
    path: '/blog/uitleg-geven-zonder-te-overspoelen',
    image: '/assets/blog-voor-zorgverleners.png',
    foregroundImage: '/assets/zorgverleners.png',
    foregroundClass: 'foreground-zorgverleners',
    age: ['6-9 jaar', '9-12 jaar'],
    theme: ['ongeneeslijk ziek'],
    goal: ['samen begrijpen'],
    intro: 'Een testblog met aandacht voor doseren, checken wat een kind al weet en aansluiten bij de taal van het gezin.',
  },
  {
    title: 'Samen iets doen na slecht nieuws',
    category: 'Voor zorgverleners',
    categoryPath: '/blog/voor-zorgverleners/',
    path: '/blog/samen-iets-doen-na-slecht-nieuws',
    image: '/assets/blog-voor-zorgverleners.png',
    foregroundImage: '/assets/zorgverleners.png',
    foregroundClass: 'foreground-zorgverleners',
    age: ['0-2 jaar', '3-5 jaar', '6-9 jaar'],
    theme: ['ernstig ziek', 'ongeneeslijk ziek'],
    goal: ['samen doen', 'samen voelen'],
    intro: 'Een testblog over eenvoudige activiteiten na slecht nieuws: tekenen, verzamelen, vertellen of gewoon samen zijn.',
  },
]

const filterGroups = [
  {
    key: 'age',
    label: 'Leeftijd',
    options: ['0-2 jaar', '3-5 jaar', '6-9 jaar', '9-12 jaar'],
  },
  {
    key: 'theme',
    label: 'Thema',
    options: ['ernstig ziek', 'ongeneeslijk ziek', 'afscheid en rouw'],
  },
  {
    key: 'goal',
    label: 'Doel',
    options: ['samen begrijpen', 'samen voelen', 'samen doen'],
  },
]

const homeTiles = [
  { path: '/blog/voor-zorgfiguren/', image: '/assets/voor-zorgfiguren.png', alt: 'Voor zorgfiguren' },
  { path: '/blog/voor-leerkrachten/', image: '/assets/voor-leerkrachten.png', alt: 'Voor leerkrachten' },
  { path: '/blog/voor-zorgverleners/', image: '/assets/voor-zorgverleners.png', alt: 'Voor zorgverleners' },
  { path: '/contact', image: '/assets/contact-card.png', alt: 'Contact' },
]

function normalizePath(path) {
  if (!path || path === '') return '/'
  if (path !== '/' && path.endsWith('/') && !path.startsWith('/blog/voor-')) {
    return path.slice(0, -1)
  }
  return path
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const path = normalizePath(window.location.pathname)
  const pageTitle = useMemo(() => {
    if (path === '/') return 'Mee in het verhaal'
    if (path === '/blog' || path.startsWith('/blog/voor-')) return 'Blog | Mee in het verhaal'
    if (path === '/over-jorane') return 'Over Jorane | Mee in het verhaal'
    if (path === '/contact') return 'Contact | Mee in het verhaal'
    const post = posts.find((item) => item.path === path)
    return post ? post.title : 'Mee in het verhaal'
  }, [path])

  React.useEffect(() => {
    document.title = pageTitle
  }, [pageTitle])

  return (
    <>
      <Header path={path} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        {path === '/' && <Home />}
        {(path === '/blog' || path === '/blog/' || path.startsWith('/blog/voor-')) && <BlogList path={window.location.pathname} />}
        {path === '/over-jorane' && <About />}
        {path === '/contact' && <Contact />}
        {posts.some((post) => post.path === path) && <BlogPost post={posts.find((post) => post.path === path)} />}
        {!isKnownPath(path) && <Home />}
      </main>
      <Footer />
    </>
  )
}

function isKnownPath(path) {
  return path === '/' || path === '/blog' || path.startsWith('/blog/voor-') || path === '/over-jorane' || path === '/contact' || posts.some((post) => post.path === path)
}

function Header({ path, menuOpen, setMenuOpen }) {
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

function isActive(path, itemPath) {
  if (itemPath === '/') return path === '/'
  if (itemPath === '/blog/') return path === '/blog' || path.startsWith('/blog/')
  return path === itemPath
}

function Home() {
  return (
    <>
      <section className="home-intro section-bg">
        <div className="page-width">
          <a className="jorane-crop" href="/over-jorane">
            <img src="/assets/jorane-janssens.png" alt="" />
          </a>
        </div>
      </section>
      <section className="tile-section section-bg">
        <div className="page-width home-grid">
          {homeTiles.map((tile) => (
            <a className="home-tile" href={tile.path} key={tile.path} aria-label={tile.alt}>
              <img src={tile.image} alt="" />
            </a>
          ))}
        </div>
      </section>
    </>
  )
}

function BlogList({ path }) {
  const [filters, setFilters] = useState({ age: [], theme: [], goal: [] })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const activeCategory = path.endsWith('/voor-zorgfiguren/') ? 'Voor zorgfiguren' : path.endsWith('/voor-leerkrachten/') ? 'Voor leerkrachten' : path.endsWith('/voor-zorgverleners/') ? 'Voor zorgverleners' : 'Alle berichten'
  const categoryPosts = activeCategory === 'Alle berichten' ? posts : posts.filter((post) => post.category === activeCategory)
  const visiblePosts = categoryPosts.filter((post) =>
    filterGroups.every((group) => filters[group.key].length === 0 || filters[group.key].some((value) => post[group.key].includes(value))),
  )
  const hasActiveFilters = filterGroups.some((group) => filters[group.key].length > 0)
  const activeFilterCount = filterGroups.reduce((count, group) => count + filters[group.key].length, 0)

  function toggleFilter(groupKey, value) {
    setFilters((current) => {
      const isActive = current[groupKey].includes(value)
      return {
        ...current,
        [groupKey]: isActive ? current[groupKey].filter((item) => item !== value) : [...current[groupKey], value],
      }
    })
  }

  function clearFilters() {
    setFilters({ age: [], theme: [], goal: [] })
  }

  return (
    <section className="blog-section section-bg">
      <div className="page-width blog-layout blog-layout-cards">
        <div className="blog-toolbar">
          <nav className="category-pills" aria-label="Blogcategorieën">
            {categories.map((category) => (
              <a className={category.label === activeCategory ? 'selected' : ''} href={category.path} key={category.path}>
                {category.label}
              </a>
            ))}
          </nav>
          <div className="filter-popover-wrap">
            <button
              className={`filter-toggle ${filtersOpen ? 'is-open' : ''}`}
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
            >
              Filters
              {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
              <i className="filter-chevron" aria-hidden="true" />
            </button>
            {filtersOpen && (
              <FilterControls filters={filters} toggleFilter={toggleFilter} clearFilters={clearFilters} hasActiveFilters={hasActiveFilters} />
            )}
          </div>
        </div>
        <div className="posts-grid">
          {visiblePosts.map((post) => (
            <a className="post-card" href={post.path} key={post.path}>
              <span className="post-thumb">
                <img className="post-thumb-bg" src={post.image} alt="" />
                {post.foregroundImage && <img className={`post-thumb-foreground ${post.foregroundClass || ''}`} src={post.foregroundImage} alt="" />}
              </span>
              <span className="post-summary">
                <span className="post-category-label">{post.category}</span>
                <span className="post-title">{post.title}</span>
                <span className="post-description">{post.intro}</span>
              </span>
            </a>
          ))}
          {visiblePosts.length === 0 && (
            <p className="empty-results">Geen berichten gevonden voor deze filters.</p>
          )}
        </div>
      </div>
    </section>
  )
}

function FilterControls({ filters, toggleFilter, clearFilters, hasActiveFilters }) {
  return (
    <div className="filter-panel" aria-label="Filter blogartikels">
      {filterGroups.map((group) => (
        <fieldset className="filter-group" key={group.key}>
          <legend>{group.label}</legend>
          <div className="filter-options">
            {group.options.map((option) => (
              <button
                className={filters[group.key].includes(option) ? 'active' : ''}
                key={option}
                type="button"
                onClick={() => toggleFilter(group.key, option)}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
      {hasActiveFilters && (
        <button className="clear-filters" type="button" onClick={clearFilters}>
          Wis filters
        </button>
      )}
    </div>
  )
}

function BlogPost({ post }) {
  const tags = [
    ...post.age,
    ...post.theme,
    ...post.goal,
  ]

  return (
    <section className="post-page">
      <article className="page-width post-article">
        <a className="back-link" href="/blog/">
          <span aria-hidden="true">‹</span> Alle berichten
        </a>
        <div className="detail-hero">
          <div className="detail-image">
            <img className="post-thumb-bg" src={post.image} alt="" />
            {post.foregroundImage && <img className={`post-thumb-foreground ${post.foregroundClass || ''}`} src={post.foregroundImage} alt="" />}
          </div>
          <div className="detail-heading">
            <a className="post-category" href={post.categoryPath}>{post.category}</a>
            <h1>{post.title}</h1>
            <p>{post.intro}</p>
          </div>
        </div>
        <div className="detail-tags" aria-label="Labels">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="post-content">
          <p>
            Dit is voorbeeldinhoud voor het detail scherm. Hier kan later de volledige blogtekst komen, met concrete tips,
            reflectievragen of kleine oefeningen die passen bij de gekozen leeftijd, het thema en het doel.
          </p>
          <p>
            De pagina is nu gekoppeld aan de blogkaarten en werkt voor alle testblogs. Daardoor kun je de navigatie,
            filters en detailweergave al goed testen terwijl de definitieve inhoud nog wordt geschreven.
          </p>
        </div>
        <ShareBlock url={`https://meeinhetverhaal.be${post.path}`} />
      </article>
    </section>
  )
}

function ShareBlock({ url }) {
  return (
    <div className="share-block">
      <span>Delen op:</span>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} aria-label="Deel dit bericht op Facebook">f</a>
      <a href={`https://twitter.com/share?url=${encodeURIComponent(url)}`} aria-label="Deel dit bericht op X">𝕏</a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} aria-label="Deel dit bericht op LinkedIn">in</a>
      <button type="button" onClick={() => navigator.clipboard?.writeText(url)} aria-label="Kopieer link naar dit bericht">⌁</button>
    </div>
  )
}

function About() {
  return (
    <section className="about-section section-bg">
      <div className="page-width">
        <a className="about-crop" href="/over-jorane">
          <img src="/assets/jorane-janssens.png" alt="" />
        </a>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section className="contact-section section-bg">
      <div className="page-width">
        <div className="wave-crop">
          <img src="/assets/golf-c3d8cb.png" alt="" />
        </div>
        <form className="contact-form" onSubmit={(event) => event.preventDefault()}>
          <label>
            Jouw naam *
            <input type="text" name="naam" autoComplete="name" />
          </label>
          <label>
            Jouw e-mailadres *
            <input type="email" name="email" autoComplete="email" />
          </label>
          <label>
            Jouw bericht *
            <textarea name="bericht" />
          </label>
          <label className="marketing">
            <input type="checkbox" name="marketing" />
            <span>Ja, ik ontvang graag nieuws over aanbiedingen.</span>
          </label>
          <div className="captcha-row">
            <span className="shield">♡</span>
            <a href="https://friendlycaptcha.com" target="_blank" rel="noreferrer">Friendly Captcha</a>
          </div>
          <button className="submit-button" type="submit">Verzenden</button>
        </form>
      </div>
    </section>
  )
}

function Footer() {
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
      </div>
    </footer>
  )
}

function SocialFacebook() {
  return <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#3c3c3c" /><path fill="#fff" d="M28.314 24.63l.572-3.741h-3.578V18.46c0-1.023.5-2.021 2.102-2.021h1.627v-3.186S27.561 13 26.149 13c-2.947 0-4.873 1.792-4.873 5.037v2.852H18v3.742h3.276v9.046a12.955 12.955 0 004.032 0v-9.046h3.006" /></svg>
}

function SocialLinkedin() {
  return <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#3c3c3c" /><path fill="#fff" d="M21.525 19.511h4.165v2.132h.06c.58-1.038 1.998-2.132 4.111-2.132 4.397 0 5.21 2.733 5.21 6.287v7.238h-4.342V26.62c0-1.53-.031-3.499-2.258-3.499-2.261 0-2.606 1.667-2.606 3.388v6.528h-4.34V19.511zm-7.525 0h4.515v13.525H14zm4.515-3.757a2.256 2.256 0 01-2.257 2.254A2.256 2.256 0 0114 15.754a2.256 2.256 0 012.258-2.254 2.256 2.256 0 012.257 2.254z" /></svg>
}

function SocialInstagram() {
  return <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#3c3c3c" /><path fill="#fff" d="M23.888 15.37c2.775 0 3.104.013 4.195.061 1.015.045 1.563.216 1.928.358.483.186.832.413 1.193.775.365.365.588.71.779 1.193.142.365.312.917.357 1.927.049 1.096.06 1.424.06 4.196 0 2.771-.011 3.104-.06 4.195-.045 1.015-.215 1.563-.357 1.928a3.212 3.212 0 01-.775 1.193c-.365.365-.71.588-1.193.779-.365.142-.917.312-1.927.357-1.096.049-1.425.06-4.196.06-2.772 0-3.104-.011-4.196-.06-1.014-.045-1.562-.215-1.927-.357a3.212 3.212 0 01-1.193-.775 3.255 3.255 0 01-.78-1.193c-.141-.365-.312-.917-.356-1.928-.05-1.095-.061-1.424-.061-4.195 0-2.772.012-3.104.06-4.196.045-1.014.216-1.562.358-1.927.186-.483.414-.832.775-1.193.365-.366.71-.589 1.193-.78.365-.141.917-.312 1.927-.357 1.092-.048 1.42-.06 4.196-.06zm0-1.87c-2.82 0-3.173.012-4.281.06-1.104.05-1.863.228-2.52.484a5.07 5.07 0 00-1.842 1.2 5.09 5.09 0 00-1.201 1.839c-.256.661-.434 1.416-.483 2.52-.049 1.112-.061 1.465-.061 4.285 0 2.82.012 3.173.06 4.28.05 1.104.228 1.863.484 2.52a5.07 5.07 0 001.2 1.843 5.078 5.078 0 001.839 1.197c.661.255 1.416.434 2.52.483 1.108.048 1.46.06 4.28.06 2.82 0 3.174-.012 4.282-.06 1.103-.05 1.862-.228 2.52-.483a5.078 5.078 0 001.838-1.197 5.078 5.078 0 001.197-1.838c.255-.662.434-1.417.483-2.52.048-1.108.06-1.461.06-4.281 0-2.82-.012-3.173-.06-4.281-.05-1.104-.228-1.863-.483-2.52a4.865 4.865 0 00-1.19-1.846 5.078 5.078 0 00-1.837-1.197c-.662-.256-1.417-.434-2.52-.483-1.112-.053-1.465-.065-4.285-.065z" /><path fill="#fff" d="M23.888 18.552a5.337 5.337 0 00-5.336 5.336 5.337 5.337 0 005.336 5.336 5.337 5.337 0 005.336-5.336 5.337 5.337 0 00-5.336-5.336zm0 8.797a3.462 3.462 0 110-6.923 3.462 3.462 0 010 6.923zm6.792-9.009a1.246 1.246 0 11-2.491 0 1.246 1.246 0 012.491 0z" /></svg>
}

createRoot(document.getElementById('root')).render(<App />)
