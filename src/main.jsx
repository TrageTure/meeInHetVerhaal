import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  deleteBlogPost,
  deleteFilterGroup,
  deleteFilterOption,
  fetchBlogData,
  getSession,
  isConfigured,
  saveBlogPost,
  saveFilters as saveSupabaseFilters,
  saveSiteContent as saveSupabaseSiteContent,
  signIn,
  signOut,
} from './blogApi'
import { sendContactEmail } from './contactApi'
import { defaultFilterGroups, defaultSiteContent, posts } from './data'
import { Header, Footer } from './components/Layout'
import { Home, About, Contact, Privacy } from './pages/StaticPages'
import { BlogList, BlogPost } from './pages/BlogPages'
import { getEmptyFilterState, normalizePath } from './utils'
import './styles.css'

const AdminCMS = React.lazy(() =>
  import('./pages/AdminCMS').then((module) => ({ default: module.AdminCMS })),
)

const BLOG_FILTER_STORAGE_KEY = 'meeinhetverhaal.blogFilters'
const BLOG_LIST_PATH_STORAGE_KEY = 'meeinhetverhaal.blogListPath'

function sanitizeBlogFilters(groups, filters) {
  const next = getEmptyFilterState(groups)
  groups.forEach((group) => {
    next[group.key] = (filters?.[group.key] || []).filter((value) => group.options.includes(value))
  })
  return next
}

function readStoredBlogFilters(groups) {
  try {
    return sanitizeBlogFilters(groups, JSON.parse(window.sessionStorage.getItem(BLOG_FILTER_STORAGE_KEY) || '{}'))
  } catch {
    return getEmptyFilterState(groups)
  }
}

function readStoredBlogListPath() {
  return window.sessionStorage.getItem(BLOG_LIST_PATH_STORAGE_KEY) || '/blog/'
}

function isBlogListPath(path) {
  return path === '/blog' || path === '/blog/' || path.startsWith('/blog/voor-')
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [allPosts, setAllPosts] = useState(posts)
  const [audiences, setAudiences] = useState([])
  const [siteFilterGroups, setSiteFilterGroups] = useState(defaultFilterGroups)
  const [siteContent, setSiteContent] = useState(defaultSiteContent)
  const [siteContentTableMissing, setSiteContentTableMissing] = useState(false)
  const [audienceLinksTableMissing, setAudienceLinksTableMissing] = useState(false)
  const [blogFilters, setBlogFilters] = useState(() => readStoredBlogFilters(defaultFilterGroups))
  const [lastBlogListPath, setLastBlogListPath] = useState(() => readStoredBlogListPath())
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
    if (path === '/privacy') return 'Privacy | Mee in het verhaal'
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
      setSiteContent(blogData.siteContent)
      setSiteContentTableMissing(blogData.siteContentTableMissing)
      setAudienceLinksTableMissing(blogData.audienceLinksTableMissing)
      setBlogFilters((current) => {
        const currentHasFilters = Object.values(current).some((values) => values.length > 0)
        return sanitizeBlogFilters(blogData.filterGroups, currentHasFilters ? current : readStoredBlogFilters(blogData.filterGroups))
      })
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

  async function removeBlogPost(postId) {
    await deleteBlogPost(postId)
    await loadBlogData()
  }

  async function removeFilterOption(optionId) {
    await deleteFilterOption(optionId)
    await loadBlogData()
  }

  async function removeFilterGroup(groupId) {
    await deleteFilterGroup(groupId)
    await loadBlogData()
  }

  async function saveSiteContent(content) {
    await saveSupabaseSiteContent(content)
    await loadBlogData()
  }

  function rememberBlogListPath(listPath) {
    const storedPath = listPath.startsWith('/blog/voor-') ? listPath : '/blog/'
    setLastBlogListPath(storedPath)
    window.sessionStorage.setItem(BLOG_LIST_PATH_STORAGE_KEY, storedPath)
  }

  React.useEffect(() => {
    document.title = pageTitle
  }, [pageTitle])

  React.useEffect(() => {
    loadBlogData()
  }, [])

  React.useEffect(() => {
    window.sessionStorage.setItem(BLOG_FILTER_STORAGE_KEY, JSON.stringify(blogFilters))
  }, [blogFilters])

  React.useEffect(() => {
    if (!isBlogListPath(path)) return
    const listPath = path.startsWith('/blog/voor-') ? window.location.pathname : '/blog/'
    setLastBlogListPath(listPath)
    window.sessionStorage.setItem(BLOG_LIST_PATH_STORAGE_KEY, listPath)
  }, [path])

  React.useEffect(() => {
    const isBlogDetailPath = allPosts.some((post) => post.path === path)
    if (isBlogListPath(path) || isBlogDetailPath) return
    const emptyFilters = getEmptyFilterState(siteFilterGroups)
    setBlogFilters(emptyFilters)
    setLastBlogListPath('/blog/')
    window.sessionStorage.setItem(BLOG_FILTER_STORAGE_KEY, JSON.stringify(emptyFilters))
    window.sessionStorage.setItem(BLOG_LIST_PATH_STORAGE_KEY, '/blog/')
  }, [path, allPosts, siteFilterGroups])

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
        {path === '/' && <Home content={siteContent.home} isLoading={dataStatus === 'loading'} />}
        {isBlogListPath(path) && (
          <BlogList
            path={window.location.pathname}
            posts={allPosts}
            filterGroups={siteFilterGroups}
            filters={blogFilters}
            setFilters={setBlogFilters}
            isLoading={dataStatus === 'loading'}
            onOpenPost={() => rememberBlogListPath(window.location.pathname)}
          />
        )}
        {path === '/beheer' && (
          <React.Suspense fallback={<AdminLoading />}>
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
              onDeletePost={removeBlogPost}
              onSaveFilterGroups={saveFilterGroups}
              onDeleteFilterOption={removeFilterOption}
              onDeleteFilterGroup={removeFilterGroup}
              siteContent={siteContent}
              siteContentTableMissing={siteContentTableMissing}
              audienceLinksTableMissing={audienceLinksTableMissing}
              onSaveSiteContent={saveSiteContent}
            />
          </React.Suspense>
        )}
        {path === '/over-jorane' && <About content={siteContent.about} isLoading={dataStatus === 'loading'} />}
        {path === '/contact' && <Contact onSubmitContact={sendContactEmail} />}
        {path === '/privacy' && <Privacy />}
        {allPosts.some((post) => post.path === path) && <BlogPost post={allPosts.find((post) => post.path === path)} filterGroups={siteFilterGroups} backPath={lastBlogListPath} />}
        {!isKnownPath(path, allPosts) && <Home content={siteContent.home} isLoading={dataStatus === 'loading'} />}
      </main>
      <Footer />
    </>
  )
}

function AdminLoading() {
  return (
    <section className="admin-section section-bg">
      <div className="page-width">
        <div className="admin-heading">
          <span>Beheer</span>
          <h1>Editor laden</h1>
          <p>De teksteditor wordt klaargezet.</p>
        </div>
      </div>
    </section>
  )
}

function isKnownPath(path, allPosts) {
  return path === '/' || isBlogListPath(path) || path === '/beheer' || path === '/over-jorane' || path === '/contact' || path === '/privacy' || allPosts.some((post) => post.path === path)
}

createRoot(document.getElementById('root')).render(<App />)
