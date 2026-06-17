import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  fetchBlogData,
  getSession,
  isConfigured,
  saveBlogPost,
  saveFilters as saveSupabaseFilters,
  signIn,
  signOut,
} from './blogApi'
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

const defaultFilterGroups = [
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

const defaultArticle = {
  title: '',
  category: 'Voor zorgfiguren',
  intro: '',
  content: '',
  age: [],
  theme: [],
  goal: [],
}

function getStoredPosts() {
  try {
    return JSON.parse(window.localStorage.getItem('meeinhetverhaal.posts') || '[]')
  } catch {
    return []
  }
}

function getStoredFilterGroups() {
  try {
    return JSON.parse(window.localStorage.getItem('meeinhetverhaal.filters') || JSON.stringify(defaultFilterGroups))
  } catch {
    return defaultFilterGroups
  }
}

function getEmptyFilterState(groups) {
  return groups.reduce((state, group) => ({ ...state, [group.key]: [] }), {})
}

function createFilterKey(label, existingGroups) {
  const baseKey = slugify(label) || `filter-${Date.now()}`
  const usedKeys = new Set(existingGroups.map((group) => group.key))
  let key = baseKey
  let counter = 2
  while (usedKeys.has(key)) {
    key = `${baseKey}-${counter}`
    counter += 1
  }
  return key
}

function mergeManagedPosts(managedPosts, basePosts) {
  const replacedPaths = new Set(managedPosts.map((post) => post.originalPath || post.path))
  return [...managedPosts, ...basePosts.filter((post) => !replacedPaths.has(post.path))]
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getCategoryConfig(category) {
  if (category === 'Voor leerkrachten') {
    return {
      categoryPath: '/blog/voor-leerkrachten/',
      image: '/assets/blog-voor-leerkrachten.png',
      foregroundImage: '/assets/leerkrachten.png',
      foregroundClass: 'foreground-leerkrachten',
    }
  }
  if (category === 'Voor zorgverleners') {
    return {
      categoryPath: '/blog/voor-zorgverleners/',
      image: '/assets/blog-voor-zorgverleners.png',
      foregroundImage: '/assets/zorgverleners.png',
      foregroundClass: 'foreground-zorgverleners',
    }
  }
  return {
    categoryPath: '/blog/voor-zorgfiguren/',
    image: '/assets/blog-voor-zorgfiguren.png',
    foregroundImage: '/assets/zorgfiguren.png',
    foregroundClass: 'foreground-zorgfiguren',
  }
}

function normalizePath(path) {
  if (!path || path === '') return '/'
  if (path !== '/' && path.endsWith('/') && !path.startsWith('/blog/voor-')) {
    return path.slice(0, -1)
  }
  return path
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [allPosts, setAllPosts] = useState(posts)
  const [audiences, setAudiences] = useState([])
  const [siteFilterGroups, setSiteFilterGroups] = useState(defaultFilterGroups)
  const [session, setSession] = useState(null)
  const [dataStatus, setDataStatus] = useState(isConfigured() ? 'loading' : 'missing-config')
  const [dataError, setDataError] = useState('')
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const path = normalizePath(currentPath)
  const pageTitle = useMemo(() => {
    if (path === '/') return 'Mee in het verhaal'
    if (path === '/blog' || path.startsWith('/blog/voor-')) return 'Blog | Mee in het verhaal'
    if (path === '/beheer') return 'Beheer | Mee in het verhaal'
    if (path === '/over-jorane') return 'Over Jorane | Mee in het verhaal'
    if (path === '/contact') return 'Contact | Mee in het verhaal'
    const post = allPosts.find((item) => item.path === path)
    return post ? post.title : 'Mee in het verhaal'
  }, [path, allPosts])

  async function loadBlogData() {
    if (!isConfigured()) {
      setDataStatus('missing-config')
      return
    }
    setDataStatus('loading')
    setDataError('')
    try {
      const [blogData, activeSession] = await Promise.all([fetchBlogData(), getSession()])
      setAudiences(blogData.audiences)
      setAllPosts(blogData.posts)
      setSiteFilterGroups(blogData.filterGroups)
      setSession(activeSession)
      setDataStatus('ready')
    } catch (error) {
      setDataError(error.message || 'De blogdata kon niet geladen worden.')
      setDataStatus('error')
    }
  }

  async function savePost(article, originalPath) {
    const savedPath = await saveBlogPost(article, originalPath, allPosts, audiences, siteFilterGroups)
    await loadBlogData()
    window.history.pushState({}, '', savedPath)
    window.dispatchEvent(new Event('popstate'))
  }

  async function saveFilterGroups(groups) {
    await saveSupabaseFilters(groups)
    await loadBlogData()
  }

  React.useEffect(() => {
    document.title = pageTitle
  }, [pageTitle])

  React.useEffect(() => {
    loadBlogData()
  }, [])

  React.useEffect(() => {
    function handleRouteChange() {
      setCurrentPath(window.location.pathname)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  return (
    <>
      <Header path={path} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        {path === '/' && <Home />}
        {(path === '/blog' || path === '/blog/' || path.startsWith('/blog/voor-')) && <BlogList path={window.location.pathname} posts={allPosts} filterGroups={siteFilterGroups} isLoading={dataStatus === 'loading'} />}
        {path === '/beheer' && (
          <AdminCMS
            posts={allPosts}
            filterGroups={siteFilterGroups}
            audiences={audiences}
            session={session}
            dataStatus={dataStatus}
            dataError={dataError}
            onLogin={async (email, password) => {
              const activeSession = await signIn(email, password)
              setSession(activeSession)
              await loadBlogData()
            }}
            onLogout={async () => {
              await signOut()
              setSession(null)
            }}
            onSavePost={savePost}
            onSaveFilterGroups={saveFilterGroups}
          />
        )}
        {path === '/over-jorane' && <About />}
        {path === '/contact' && <Contact />}
        {allPosts.some((post) => post.path === path) && <BlogPost post={allPosts.find((post) => post.path === path)} filterGroups={siteFilterGroups} />}
        {!isKnownPath(path, allPosts) && <Home />}
      </main>
      <Footer />
    </>
  )
}

function isKnownPath(path, allPosts) {
  return path === '/' || path === '/blog' || path.startsWith('/blog/voor-') || path === '/beheer' || path === '/over-jorane' || path === '/contact' || allPosts.some((post) => post.path === path)
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

function BlogList({ path, posts: blogPosts, filterGroups, isLoading }) {
  const [filters, setFilters] = useState(() => getEmptyFilterState(filterGroups))
  const [filtersOpen, setFiltersOpen] = useState(false)
  const activeCategory = path.endsWith('/voor-zorgfiguren/') ? 'Voor zorgfiguren' : path.endsWith('/voor-leerkrachten/') ? 'Voor leerkrachten' : path.endsWith('/voor-zorgverleners/') ? 'Voor zorgverleners' : 'Alle berichten'
  const categoryPosts = activeCategory === 'Alle berichten' ? blogPosts : blogPosts.filter((post) => post.category === activeCategory)
  const visiblePosts = categoryPosts.filter((post) =>
    filterGroups.every((group) => (filters[group.key] || []).length === 0 || (filters[group.key] || []).some((value) => (post[group.key] || []).includes(value))),
  )
  const hasActiveFilters = filterGroups.some((group) => (filters[group.key] || []).length > 0)
  const activeFilterCount = filterGroups.reduce((count, group) => count + (filters[group.key] || []).length, 0)

  React.useEffect(() => {
    setFilters((current) => {
      const next = getEmptyFilterState(filterGroups)
      filterGroups.forEach((group) => {
        next[group.key] = (current[group.key] || []).filter((value) => group.options.includes(value))
      })
      return next
    })
  }, [filterGroups])

  function toggleFilter(groupKey, value) {
    setFilters((current) => {
      const currentValues = current[groupKey] || []
      const isActive = currentValues.includes(value)
      return {
        ...current,
        [groupKey]: isActive ? currentValues.filter((item) => item !== value) : [...currentValues, value],
      }
    })
  }

  function clearFilters() {
    setFilters(getEmptyFilterState(filterGroups))
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
              <FilterControls filterGroups={filterGroups} filters={filters} toggleFilter={toggleFilter} clearFilters={clearFilters} hasActiveFilters={hasActiveFilters} />
            )}
          </div>
        </div>
        <div className="posts-grid">
          {isLoading && Array.from({ length: 6 }).map((_, index) => (
            <article className="post-card skeleton-card" key={`skeleton-${index}`} aria-hidden="true">
              <span className="post-thumb skeleton-thumb">
                <span className="skeleton-wave" />
              </span>
              <span className="post-summary">
                <span className="skeleton-line skeleton-line-small" />
                <span className="skeleton-line skeleton-line-title" />
                <span className="skeleton-line" />
                <span className="skeleton-line skeleton-line-short" />
              </span>
            </article>
          ))}
          {!isLoading && visiblePosts.map((post) => (
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
          {!isLoading && visiblePosts.length === 0 && (
            <p className="empty-results">Geen berichten gevonden voor deze filters.</p>
          )}
        </div>
      </div>
    </section>
  )
}

function FilterControls({ filterGroups, filters, toggleFilter, clearFilters, hasActiveFilters }) {
  return (
    <div className="filter-panel" aria-label="Filter blogartikels">
      {filterGroups.map((group) => (
        <fieldset className="filter-group" key={group.key}>
          <legend>{group.label}</legend>
          <div className="filter-options">
            {group.options.map((option) => (
              <button
                className={(filters[group.key] || []).includes(option) ? 'active' : ''}
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

function articleFromPost(post, filterGroups) {
  const article = {
    ...defaultArticle,
    ...post,
    content: post.content || '',
    path: post.path,
    originalPath: post.originalPath || post.path,
  }
  filterGroups.forEach((group) => {
    article[group.key] = post[group.key] || []
  })
  return article
}

function AdminCMS({ posts: editablePosts, filterGroups, audiences, session, dataStatus, dataError, onLogin, onLogout, onSavePost, onSaveFilterGroups }) {
  const [article, setArticle] = useState(defaultArticle)
  const [selectedPath, setSelectedPath] = useState('')
  const [draftFilterGroups, setDraftFilterGroups] = useState(filterGroups)
  const [newFilterValues, setNewFilterValues] = useState(getEmptyFilterState(filterGroups))
  const [activeAdminView, setActiveAdminView] = useState('new')
  const [newFilterGroup, setNewFilterGroup] = useState({ label: '', option: '' })
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [adminMessage, setAdminMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const isEditing = Boolean(selectedPath)
  const categoryConfig = getCategoryConfig(article.category)
  const audienceOptions = audiences.length > 0
    ? audiences.map((audience) => audience.name)
    : categories.slice(1).map((category) => category.label)
  const previewPost = {
    ...article,
    ...categoryConfig,
    title: article.title || 'Titel van je blogartikel',
    intro: article.intro || 'Schrijf hier een korte beschrijving die gezinnen, leerkrachten of zorgverleners meteen helpt begrijpen waar dit artikel over gaat.',
  }
  const hasEveryFilterGroup = filterGroups.every((group) => group.options.length === 0 || (article[group.key] || []).length > 0)
  const canSave = article.title.trim() && article.intro.trim() && (isEditing || article.content.trim()) && hasEveryFilterGroup

  React.useEffect(() => {
    setDraftFilterGroups(filterGroups)
    setNewFilterValues(getEmptyFilterState(filterGroups))
    setArticle((current) => {
      const next = { ...current }
      filterGroups.forEach((group) => {
        next[group.key] = (current[group.key] || []).filter((value) => group.options.includes(value))
      })
      return next
    })
  }, [filterGroups])

  function startNewArticle() {
    setSelectedPath('')
    setArticle(defaultArticle)
  }

  function openNewArticle() {
    setActiveAdminView('new')
    startNewArticle()
  }

  function openManageArticles() {
    setActiveAdminView('manage')
    if (!selectedPath && editablePosts[0]) {
      selectArticle(editablePosts[0].path)
    }
  }

  function selectArticle(path) {
    const post = editablePosts.find((item) => item.path === path)
    if (!post) return
    setSelectedPath(post.originalPath || post.path)
    setArticle(articleFromPost(post, filterGroups))
  }

  function updateField(field, value) {
    setArticle((current) => ({ ...current, [field]: value }))
  }

  function toggleCmsChip(groupKey, value) {
    setArticle((current) => {
      const currentValues = current[groupKey] || []
      const isActive = currentValues.includes(value)
      return {
        ...current,
        [groupKey]: isActive ? currentValues.filter((item) => item !== value) : [...currentValues, value],
      }
    })
  }

  async function submitLogin(event) {
    event.preventDefault()
    setAdminMessage('')
    setIsSaving(true)
    try {
      await onLogin(loginForm.email, loginForm.password)
    } catch (error) {
      setAdminMessage(error.message || 'Inloggen is niet gelukt.')
    } finally {
      setIsSaving(false)
    }
  }

  async function submitArticle(event) {
    event.preventDefault()
    if (!canSave) return
    setAdminMessage('')
    setIsSaving(true)
    try {
      await onSavePost(article, selectedPath || article.originalPath)
      setAdminMessage(activeAdminView === 'manage' ? 'Wijzigingen opgeslagen.' : 'Blog gepubliceerd.')
    } catch (error) {
      setAdminMessage(error.message || 'Opslaan is niet gelukt.')
    } finally {
      setIsSaving(false)
    }
  }

  function updateFilterOption(groupKey, optionIndex, value) {
    setDraftFilterGroups((current) =>
      current.map((group) =>
        group.key === groupKey
          ? { ...group, options: group.options.map((option, index) => (index === optionIndex ? value : option)) }
          : group,
      ),
    )
  }

  function updateFilterGroupLabel(groupKey, value) {
    setDraftFilterGroups((current) =>
      current.map((group) => (group.key === groupKey ? { ...group, label: value } : group)),
    )
  }

  function updateNewFilterValue(groupKey, value) {
    setNewFilterValues((current) => ({ ...current, [groupKey]: value }))
  }

  function addFilterOption(groupKey) {
    const value = (newFilterValues[groupKey] || '').trim()
    if (!value) return
    setDraftFilterGroups((current) =>
      current.map((group) =>
        group.key === groupKey && !group.options.includes(value)
          ? { ...group, options: [...group.options, value] }
          : group,
      ),
    )
    setNewFilterValues((current) => ({ ...current, [groupKey]: '' }))
  }

  function addFilterGroup() {
    const label = newFilterGroup.label.trim()
    const option = newFilterGroup.option.trim()
    if (!label) return
    const key = createFilterKey(label, draftFilterGroups)
    setDraftFilterGroups((current) => [
        ...current,
        {
          key,
          label,
          options: option ? [option] : [],
        },
      ])
    setNewFilterValues((current) => ({ ...current, [key]: '' }))
    setNewFilterGroup({ label: '', option: '' })
  }

  async function saveFilters() {
    const cleanedGroups = draftFilterGroups.map((group) => {
      const uniqueOptions = []
      group.options.forEach((option) => {
        const trimmed = option.trim()
        if (trimmed && !uniqueOptions.includes(trimmed)) uniqueOptions.push(trimmed)
      })
      return { ...group, label: group.label.trim() || 'Nieuwe filter', options: uniqueOptions }
    })
    const filterChanges = []
    cleanedGroups.forEach((group) => {
      const originalGroup = filterGroups.find((item) => item.key === group.key)
      group.options.forEach((option, index) => {
        const originalOption = originalGroup?.options[index]
        if (originalOption && originalOption !== option) {
          filterChanges.push({ groupKey: group.key, from: originalOption, to: option })
        }
      })
    })
    setAdminMessage('')
    setIsSaving(true)
    try {
      await onSaveFilterGroups(cleanedGroups, filterChanges)
      setAdminMessage('Filters opgeslagen.')
    } catch (error) {
      setAdminMessage(error.message || 'Filters opslaan is niet gelukt.')
    } finally {
      setIsSaving(false)
    }
  }

  if (dataStatus === 'missing-config') {
    return (
      <section className="admin-section section-bg">
        <div className="page-width">
          <div className="admin-heading">
            <span>Beheer</span>
            <h1>Supabase instellen</h1>
            <p>Voeg je Supabase URL en anon key toe aan `.env.local` om het CMS met de database te verbinden.</p>
          </div>
          <div className="admin-panel">
            <code>VITE_SUPABASE_URL=...</code>
            <code>VITE_SUPABASE_ANON_KEY=...</code>
          </div>
        </div>
      </section>
    )
  }

  if (dataStatus === 'error') {
    return (
      <section className="admin-section section-bg">
        <div className="page-width">
          <div className="admin-heading">
            <span>Beheer</span>
            <h1>Database niet bereikbaar</h1>
            <p>{dataError}</p>
          </div>
        </div>
      </section>
    )
  }

  if (dataStatus === 'loading') {
    return (
      <section className="admin-section section-bg">
        <div className="page-width">
          <div className="admin-heading">
            <span>Beheer</span>
            <h1>Beheer laden</h1>
            <p>We halen je blogs en filters op uit Supabase.</p>
          </div>
          <div className="admin-layout admin-overlay">
            <div className="admin-form">
              {Array.from({ length: 3 }).map((_, index) => (
                <section className="admin-panel skeleton-admin-panel" key={index} aria-hidden="true">
                  <span className="skeleton-line skeleton-line-small" />
                  <span className="skeleton-line skeleton-line-title" />
                  <span className="skeleton-input" />
                  <span className="skeleton-input" />
                </section>
              ))}
            </div>
            <aside className="admin-preview" aria-hidden="true">
              <div className="preview-sticky">
                <div className="preview-label">Live preview</div>
                <article className="post-card skeleton-card">
                  <span className="post-thumb skeleton-thumb">
                    <span className="skeleton-wave" />
                  </span>
                  <span className="post-summary">
                    <span className="skeleton-line skeleton-line-small" />
                    <span className="skeleton-line skeleton-line-title" />
                    <span className="skeleton-line" />
                  </span>
                </article>
              </div>
            </aside>
          </div>
        </div>
      </section>
    )
  }

  if (!session) {
    return (
      <section className="admin-section section-bg">
        <div className="page-width admin-login-layout">
          <div className="admin-heading">
            <span>Beheer</span>
            <h1>Inloggen</h1>
            <p>Log in om blogs en filters te beheren.</p>
          </div>
          <form className="admin-panel admin-login-panel" onSubmit={submitLogin}>
            <label className="admin-field">
              E-mailadres
              <input type="email" value={loginForm.email} onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))} />
            </label>
            <label className="admin-field">
              Wachtwoord
              <input type="password" value={loginForm.password} onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))} />
            </label>
            {adminMessage && <p className="admin-message">{adminMessage}</p>}
            <button className="publish-button admin-login-button" type="submit" disabled={isSaving}>{isSaving ? 'Bezig...' : 'Inloggen'}</button>
          </form>
        </div>
      </section>
    )
  }

  return (
    <section className="admin-section section-bg">
      <div className="page-width">
        <div className="admin-heading">
          <span>Beheer</span>
          <h1>{activeAdminView === 'new' ? 'Nieuwe blog aanmaken' : activeAdminView === 'manage' ? 'Bestaande blogs beheren' : 'Filters beheren'}</h1>
          <p>{activeAdminView === 'new' ? 'Schrijf een nieuw artikel in een rustige editor met live preview.' : activeAdminView === 'manage' ? 'Kies een bestaande blog, pas hem aan en bekijk meteen hoe de kaart eruitziet.' : 'Voeg filteropties toe of hernoem bestaande filters zonder de artikel-editor te openen.'}</p>
        </div>

        <div className="admin-session-row">
          <span>Ingelogd als {session.user.email}</span>
          <button type="button" onClick={onLogout}>Uitloggen</button>
        </div>

        <div className="admin-view-switch" aria-label="Beheer wisselen">
          <button className={activeAdminView === 'new' ? 'active' : ''} type="button" onClick={openNewArticle}>
            Nieuwe blog
          </button>
          <button className={activeAdminView === 'manage' ? 'active' : ''} type="button" onClick={openManageArticles}>
            Bestaande blogs
          </button>
          <button className={activeAdminView === 'filters' ? 'active' : ''} type="button" onClick={() => setActiveAdminView('filters')}>
            Filters
          </button>
        </div>
        {adminMessage && <p className="admin-message">{adminMessage}</p>}

        {(activeAdminView === 'new' || activeAdminView === 'manage') && (
          <div className="admin-layout admin-overlay">
            <form className="admin-form" onSubmit={submitArticle}>
              {activeAdminView === 'manage' && (
                <section className="admin-panel">
                  <div className="panel-title">
                    <span>1</span>
                    <div>
                      <h2>Artikels</h2>
                      <p>Kies welke blog je wil bewerken.</p>
                    </div>
                  </div>
                  <div className="article-picker" aria-label="Bestaande blogartikels">
                    {editablePosts.map((post) => (
                      <button
                        className={(post.originalPath || post.path) === selectedPath ? 'active' : ''}
                        key={post.path}
                        type="button"
                        onClick={() => selectArticle(post.path)}
                      >
                        <span>{post.category}</span>
                        {post.title}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              <section className="admin-panel">
                <div className="panel-title">
                  <span>{activeAdminView === 'manage' ? '2' : '1'}</span>
                  <div>
                    <h2>Basis</h2>
                    <p>Titel, doelgroep en korte omschrijving.</p>
                  </div>
                </div>
                <label className="admin-field">
                  Titel
                  <input value={article.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Bijvoorbeeld: Praten over verdriet" />
                </label>
                <label className="admin-field">
                  Doelgroep
                  <select value={article.category} onChange={(event) => updateField('category', event.target.value)}>
                    {audienceOptions.map((audienceName) => (
                      <option key={audienceName} value={audienceName}>{audienceName}</option>
                    ))}
                  </select>
                </label>
                <label className="admin-field">
                  Korte beschrijving
                  <textarea value={article.intro} onChange={(event) => updateField('intro', event.target.value)} rows="3" placeholder="Een warme intro van maximaal enkele zinnen." />
                </label>
              </section>

              <section className="admin-panel">
                <div className="panel-title">
                  <span>{activeAdminView === 'manage' ? '3' : '2'}</span>
                  <div>
                    <h2>Filters</h2>
                    <p>Kies wat straks vindbaar moet zijn.</p>
                  </div>
                </div>
                {filterGroups.map((group) => (
                  <fieldset className="cms-filter-group" key={group.key}>
                    <legend>{group.label}</legend>
                    <div className="cms-chip-row">
                      {group.options.map((option) => (
                        <button className={(article[group.key] || []).includes(option) ? 'active' : ''} key={option} type="button" onClick={() => toggleCmsChip(group.key, option)}>
                          {option}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </section>

              <section className="admin-panel">
                <div className="panel-title">
                  <span>{activeAdminView === 'manage' ? '4' : '3'}</span>
                  <div>
                    <h2>Inhoud</h2>
                    <p>Deze tekst komt op het detail scherm.</p>
                  </div>
                </div>
                <label className="admin-field">
                  Artikeltekst
                  <textarea className="article-body-input" value={article.content} onChange={(event) => updateField('content', event.target.value)} rows="8" placeholder="Schrijf je artikeltekst hier..." />
                </label>
              </section>

              <div className="admin-actions">
                <button type="button" onClick={activeAdminView === 'manage' ? openManageArticles : startNewArticle}>{activeAdminView === 'manage' ? 'Herlaad selectie' : 'Leegmaken'}</button>
                <button className="publish-button" type="submit" disabled={!canSave || isSaving}>{isSaving ? 'Opslaan...' : activeAdminView === 'manage' ? 'Wijzigingen opslaan' : 'Publiceren'}</button>
              </div>
            </form>

            <aside className="admin-preview" aria-label="Live preview">
              <div className="preview-sticky">
                <div className="preview-label">Live preview</div>
                <a className="post-card preview-card" href="/beheer" onClick={(event) => event.preventDefault()}>
                  <span className="post-thumb">
                    <img className="post-thumb-bg" src={previewPost.image} alt="" />
                    <img className={`post-thumb-foreground ${previewPost.foregroundClass}`} src={previewPost.foregroundImage} alt="" />
                  </span>
                  <span className="post-summary">
                    <span className="post-category-label">{previewPost.category}</span>
                    <span className="post-title">{previewPost.title}</span>
                    <span className="post-description">{previewPost.intro}</span>
                  </span>
                </a>
                <div className="preview-checklist">
                  <span className={article.title.trim() ? 'done' : ''}>Titel</span>
                  <span className={article.intro.trim() ? 'done' : ''}>Beschrijving</span>
                  <span className={isEditing || article.content.trim() ? 'done' : ''}>Tekst</span>
                  <span className={hasEveryFilterGroup ? 'done' : ''}>Filters</span>
                </div>
                {activeAdminView === 'manage' && isEditing && <a className="preview-open-link" href={article.path}>Bekijk artikel</a>}
              </div>
            </aside>
          </div>
        )}

        {activeAdminView === 'filters' && (
          <div className="admin-overlay filters-overlay">
            <section className="admin-panel filter-admin-panel">
              <div className="panel-title">
                <span>1</span>
                <div>
                  <h2>Filtercategorieën</h2>
                  <p>Maak nieuwe filterthema's aan, pas labels aan of voeg opties toe.</p>
                </div>
              </div>
              <div className="new-filter-group-box">
                <h3>Nieuwe filtercategorie</h3>
                <div className="new-filter-group-grid">
                  <label>
                    Naam
                    <input
                      value={newFilterGroup.label}
                      onChange={(event) => setNewFilterGroup((current) => ({ ...current, label: event.target.value }))}
                      placeholder="Bijvoorbeeld: Werkvorm"
                    />
                  </label>
                  <label>
                    Eerste optie
                    <input
                      value={newFilterGroup.option}
                      onChange={(event) => setNewFilterGroup((current) => ({ ...current, option: event.target.value }))}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          addFilterGroup()
                        }
                      }}
                      placeholder="Bijvoorbeeld: gesprek"
                    />
                  </label>
                  <button type="button" onClick={addFilterGroup}>Categorie toevoegen</button>
                </div>
              </div>
              <div className="filter-manager">
                {draftFilterGroups.map((group) => (
                  <div className="filter-editor-group" key={group.key}>
                    <label className="filter-name-row">
                      Filtercategorie
                      <input value={group.label} onChange={(event) => updateFilterGroupLabel(group.key, event.target.value)} />
                    </label>
                    {group.options.map((option, index) => (
                      <label className="filter-edit-row" key={`${group.key}-${index}`}>
                        <span>Optie {index + 1}</span>
                        <input value={option} onChange={(event) => updateFilterOption(group.key, index, event.target.value)} />
                      </label>
                    ))}
                    <div className="add-filter-row">
                      <input
                        value={newFilterValues[group.key] || ''}
                        onChange={(event) => updateNewFilterValue(group.key, event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault()
                            addFilterOption(group.key)
                          }
                        }}
                        placeholder={`Nieuwe ${group.label.toLowerCase()}`}
                      />
                      <button type="button" onClick={() => addFilterOption(group.key)}>Toevoegen</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="save-filters-button" type="button" onClick={saveFilters} disabled={isSaving}>
                {isSaving ? 'Opslaan...' : 'Filters opslaan'}
              </button>
            </section>

            <aside className="admin-panel filter-summary-panel">
              <div className="panel-title">
                <span>2</span>
                <div>
                  <h2>Overzicht</h2>
                  <p>Dit zijn de opties die gebruikers straks zien.</p>
                </div>
              </div>
              {draftFilterGroups.map((group) => (
                <div className="filter-summary-group" key={group.key}>
                  <h3>{group.label}</h3>
                  <div className="cms-chip-row">
                    {group.options.filter(Boolean).map((option) => (
                      <span key={option}>{option}</span>
                    ))}
                  </div>
                </div>
              ))}
            </aside>
          </div>
        )}
            </div>
    </section>
  )
}

function BlogPost({ post, filterGroups }) {
  const tags = filterGroups.flatMap((group) => post[group.key] || [])
  const contentParagraphs = (post.content || '')
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

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
          {contentParagraphs.length > 0 ? (
            contentParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
          ) : (
            <>
              <p>
                Dit is voorbeeldinhoud voor het detail scherm. Hier kan later de volledige blogtekst komen, met concrete tips,
                reflectievragen of kleine oefeningen die passen bij de gekozen leeftijd, het thema en het doel.
              </p>
              <p>
                De pagina is nu gekoppeld aan de blogkaarten en werkt voor alle testblogs. Daardoor kun je de navigatie,
                filters en detailweergave al goed testen terwijl de definitieve inhoud nog wordt geschreven.
              </p>
            </>
          )}
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
