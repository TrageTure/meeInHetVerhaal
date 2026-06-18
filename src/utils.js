export function getEmptyFilterState(groups) {
  return groups.reduce((state, group) => ({ ...state, [group.key]: [] }), {})
}

export function createFilterKey(label, existingGroups) {
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

export function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getCategoryConfig(category) {
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

export function normalizePath(path) {
  if (!path || path === '') return '/'
  if (path !== '/' && path.endsWith('/') && !path.startsWith('/blog/voor-')) {
    return path.slice(0, -1)
  }
  return path
}
