import React, { useState } from 'react'
import { categories, defaultArticle } from '../data'
import { createFilterKey, getCategoryConfig, getEmptyFilterState } from '../utils'

export function articleFromPost(post, filterGroups) {
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

export function AdminCMS({
  posts: editablePosts,
  filterGroups,
  audiences,
  session,
  dataStatus,
  dataError,
  onLogin,
  onLogout,
  onSavePost,
  onSaveFilterGroups,
  siteContent,
  siteContentTableMissing,
  onSaveSiteContent,
}) {
  const [article, setArticle] = useState(defaultArticle)
  const [selectedPath, setSelectedPath] = useState('')
  const [draftFilterGroups, setDraftFilterGroups] = useState(filterGroups)
  const [newFilterValues, setNewFilterValues] = useState(getEmptyFilterState(filterGroups))
  const [activeAdminView, setActiveAdminView] = useState('new')
  const [newFilterGroup, setNewFilterGroup] = useState({ label: '', option: '' })
  const [draftSiteContent, setDraftSiteContent] = useState(() => ({
    home: { ...siteContent.home },
    about: { ...siteContent.about },
  }))
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
  const canSaveSiteContent = Object.values(draftSiteContent).every((page) => page.title.trim() && page.body.trim())
  const adminViewTitle = {
    new: 'Nieuwe blog aanmaken',
    manage: 'Bestaande blogs beheren',
    filters: 'Filters beheren',
    pages: 'Pagina-inhoud beheren',
  }[activeAdminView]
  const adminViewDescription = {
    new: 'Schrijf een nieuw artikel in een rustige editor met live preview.',
    manage: 'Kies een bestaande blog, pas hem aan en bekijk meteen hoe de kaart eruitziet.',
    filters: 'Voeg filteropties toe of hernoem bestaande filters zonder de artikel-editor te openen.',
    pages: 'Pas de titel en introductietekst van Home en Over Jorane aan.',
  }[activeAdminView]

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

  React.useEffect(() => {
    setDraftSiteContent({
      home: { ...siteContent.home },
      about: { ...siteContent.about },
    })
  }, [siteContent])

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

  function updatePageContent(pageKey, field, value) {
    setDraftSiteContent((current) => ({
      ...current,
      [pageKey]: {
        ...current[pageKey],
        [field]: value,
      },
    }))
  }

  async function savePages(event) {
    event.preventDefault()
    if (!canSaveSiteContent) return
    setAdminMessage('')
    setIsSaving(true)
    try {
      await onSaveSiteContent(draftSiteContent)
      setAdminMessage('Pagina-inhoud opgeslagen.')
    } catch (error) {
      setAdminMessage(error.message || 'Pagina-inhoud opslaan is niet gelukt.')
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
            <p>We halen je blogs, filters en pagina-inhoud op uit Supabase.</p>
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
            <p>Log in om blogs, filters en pagina-inhoud te beheren.</p>
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
          <h1>{adminViewTitle}</h1>
          <p>{adminViewDescription}</p>
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
          <button className={activeAdminView === 'pages' ? 'active' : ''} type="button" onClick={() => setActiveAdminView('pages')}>
            Pagina's
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

        {activeAdminView === 'pages' && (
          <form className="admin-overlay page-content-overlay" onSubmit={savePages}>
            <div className="page-content-editors">
              {siteContentTableMissing && (
                <p className="admin-message">
                  De pagina-inhoud gebruikt voorlopig de standaardtekst. Voer de nieuwe Supabase-migratie uit om wijzigingen te kunnen bewaren.
                </p>
              )}
              <section className="admin-panel">
                <div className="panel-title">
                  <span>1</span>
                  <div>
                    <h2>Home</h2>
                    <p>De grote titel en introductietekst bovenaan de startpagina.</p>
                  </div>
                </div>
                <label className="admin-field">
                  Titel
                  <input
                    value={draftSiteContent.home.title}
                    onChange={(event) => updatePageContent('home', 'title', event.target.value)}
                  />
                </label>
                <label className="admin-field">
                  Introductietekst
                  <textarea
                    value={draftSiteContent.home.body}
                    onChange={(event) => updatePageContent('home', 'body', event.target.value)}
                    rows="5"
                  />
                </label>
              </section>

              <section className="admin-panel">
                <div className="panel-title">
                  <span>2</span>
                  <div>
                    <h2>Over Jorane</h2>
                    <p>De titel en tekst naast de foto. Gebruik een lege regel voor een nieuwe alinea.</p>
                  </div>
                </div>
                <label className="admin-field">
                  Titel
                  <input
                    value={draftSiteContent.about.title}
                    onChange={(event) => updatePageContent('about', 'title', event.target.value)}
                  />
                </label>
                <label className="admin-field">
                  Tekst
                  <textarea
                    className="page-content-body-input"
                    value={draftSiteContent.about.body}
                    onChange={(event) => updatePageContent('about', 'body', event.target.value)}
                    rows="10"
                  />
                </label>
              </section>

              <div className="admin-actions">
                <button
                  type="button"
                  onClick={() => setDraftSiteContent({
                    home: { ...siteContent.home },
                    about: { ...siteContent.about },
                  })}
                >
                  Wijzigingen herstellen
                </button>
                <button className="publish-button" type="submit" disabled={!canSaveSiteContent || isSaving || siteContentTableMissing}>
                  {isSaving ? 'Opslaan...' : 'Pagina-inhoud opslaan'}
                </button>
              </div>
            </div>

            <aside className="admin-panel page-content-preview" aria-label="Live voorbeeld pagina-inhoud">
              <div className="preview-label">Live voorbeeld</div>
              <div className="page-preview-block">
                <span>Home</span>
                <h2>{draftSiteContent.home.title || 'Titel van de homepagina'}</h2>
                <p>{draftSiteContent.home.body || 'De introductietekst verschijnt hier.'}</p>
              </div>
              <div className="page-preview-block">
                <span>Over Jorane</span>
                <h2>{draftSiteContent.about.title || 'Titel van Over Jorane'}</h2>
                {draftSiteContent.about.body
                  .split(/\n+/)
                  .map((paragraph) => paragraph.trim())
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </aside>
          </form>
        )}
            </div>
    </section>
  )
}
