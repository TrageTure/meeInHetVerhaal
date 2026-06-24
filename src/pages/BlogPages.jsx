import React, { useState } from 'react'
import { categories } from '../data'
import { AudienceVisual } from '../components/AudienceVisual'
import { isRichTextEmpty, sanitizeRichText } from '../richText'
import { getAudienceTone, getEmptyFilterState } from '../utils'

export function BlogList({ path, posts: blogPosts, filterGroups, filters, setFilters, isLoading, onOpenPost }) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [categoryScroll, setCategoryScroll] = useState({ canScrollLeft: false, canScrollRight: false })
  const categoryPillsRef = React.useRef(null)
  const categoryPath = path.replace(/\/+$/, '')
  const activeCategory = categoryPath.endsWith('/voor-zorgfiguren') ? 'Voor zorgfiguren' : categoryPath.endsWith('/voor-leerkrachten') ? 'Voor leerkrachten' : categoryPath.endsWith('/voor-zorgverleners') ? 'Voor zorgverleners' : 'Alle berichten'
  const categoryPosts = activeCategory === 'Alle berichten'
    ? blogPosts
    : blogPosts.filter((post) => (post.audienceNames || [post.category]).includes(activeCategory))
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

  React.useEffect(() => {
    const scroller = categoryPillsRef.current
    if (!scroller) return undefined

    function updateCategoryScroll() {
      const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth
      setCategoryScroll({
        canScrollLeft: scroller.scrollLeft > 2,
        canScrollRight: maxScrollLeft - scroller.scrollLeft > 2,
      })
    }

    updateCategoryScroll()
    scroller.addEventListener('scroll', updateCategoryScroll, { passive: true })
    const resizeObserver = new ResizeObserver(updateCategoryScroll)
    resizeObserver.observe(scroller)

    return () => {
      scroller.removeEventListener('scroll', updateCategoryScroll)
      resizeObserver.disconnect()
    }
  }, [])

  function scrollCategories(direction) {
    categoryPillsRef.current?.scrollBy({
      left: direction * Math.min(categoryPillsRef.current.clientWidth * 0.7, 280),
      behavior: 'smooth',
    })
  }

  function selectCategory(event, categoryPath) {
    event.preventDefault()
    if (window.location.pathname === categoryPath) return
    window.history.pushState({}, '', categoryPath)
    window.dispatchEvent(new Event('popstate'))
  }

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
          <div
            className={`category-scroll ${categoryScroll.canScrollLeft ? 'has-left' : ''} ${categoryScroll.canScrollRight ? 'has-right' : ''}`}
          >
            <button
              className="category-scroll-arrow category-scroll-left"
              type="button"
              aria-label="Vorige doelgroepen"
              onClick={() => scrollCategories(-1)}
            />
            <nav className="category-pills" aria-label="Blogcategorieën" ref={categoryPillsRef}>
              {categories.map((category) => (
                <a
                  className={`audience-${category.tone} ${category.label === activeCategory ? 'selected' : ''}`}
                  href={category.path}
                  key={category.path}
                  onClick={(event) => selectCategory(event, category.path)}
                >
                  {category.label}
                </a>
              ))}
            </nav>
            <button
              className="category-scroll-arrow category-scroll-right"
              type="button"
              aria-label="Volgende doelgroepen"
              onClick={() => scrollCategories(1)}
            />
          </div>
          <div className="filter-popover-wrap">
            <button
              className={`filter-toggle ${filtersOpen ? 'is-open' : ''}`}
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
            >
              Filters
              <span className="filter-toggle-actions">
                {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
                <i className="filter-chevron" aria-hidden="true" />
              </span>
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
            <a className="post-card" href={post.path} key={post.path} onClick={onOpenPost}>
              <AudienceVisual className="post-thumb" audiences={post.audiences} fallbackImage={post.image} />
              <span className="post-summary">
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

export function FilterControls({ filterGroups, filters, toggleFilter, clearFilters, hasActiveFilters }) {
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

export function BlogPost({ post, filterGroups, backPath = '/blog/' }) {
  const tags = filterGroups.flatMap((group) => post[group.key] || [])
  const hasContent = !isRichTextEmpty(post.content)
  const contentHtml = sanitizeRichText(post.content)

  return (
    <section className="post-page">
      <article className="page-width post-article">
        <a className="back-link" href={backPath}>
          <span aria-hidden="true">‹</span> Terug naar overzicht
        </a>
        <div className="detail-hero">
          <AudienceVisual className="detail-image" audiences={post.audiences} fallbackImage={post.image} />
          <div className="detail-heading">
            <div className="post-categories">
              {(post.audiences || [{ name: post.category, categoryPath: post.categoryPath }]).map((audience) => (
                <a
                  className={`post-category audience-${getAudienceTone(audience.name)}`}
                  href={audience.categoryPath}
                  key={audience.name}
                >
                  {audience.name}
                </a>
              ))}
            </div>
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
          {hasContent ? (
            <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
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

export function ShareBlock({ url }) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = url
      textArea.setAttribute('readonly', '')
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <div className="share-block">
      <span>Delen op:</span>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} aria-label="Deel dit bericht op Facebook">f</a>
      <a href={`https://twitter.com/share?url=${encodeURIComponent(url)}`} aria-label="Deel dit bericht op X">𝕏</a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} aria-label="Deel dit bericht op LinkedIn">in</a>
      <button className="copy-link-button" type="button" onClick={copyLink} aria-label="Kopieer link naar dit bericht">
        <LinkIcon />
      </button>
      <span className={`copy-link-feedback ${copied ? 'is-visible' : ''}`} aria-live="polite">
        Gekopieerd
      </span>
    </div>
  )
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M9.6 8H7.2a4 4 0 0 0 0 8h2.4" />
      <path d="M14.4 8h2.4a4 4 0 0 1 0 8h-2.4" />
      <path d="M8.6 12h6.8" />
    </svg>
  )
}
