import React, { useState } from 'react'
import { categories } from '../data'
import { getEmptyFilterState } from '../utils'

export function BlogList({ path, posts: blogPosts, filterGroups, isLoading }) {
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

export function BlogPost({ post, filterGroups }) {
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

export function ShareBlock({ url }) {
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
