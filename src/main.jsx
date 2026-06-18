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
import { sendContactEmail } from './contactApi'
import { defaultFilterGroups, posts } from './data'
import { Header, Footer } from './components/Layout'
import { Home, About, Contact } from './pages/StaticPages'
import { BlogList, BlogPost } from './pages/BlogPages'
import { AdminCMS } from './pages/AdminCMS'
import { normalizePath } from './utils'
import './styles.css'

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
        {path === '/contact' && <Contact onSubmitContact={sendContactEmail} />}
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

createRoot(document.getElementById('root')).render(<App />)
