import { isSupabaseConfigured, supabase } from './supabaseClient'
import { defaultSiteContent } from './data'

function toCategory(audience) {
  return {
    audienceId: audience.id,
    audienceSlug: audience.slug,
    category: audience.name,
    categoryPath: audience.category_path,
    image: audience.image_path,
    foregroundImage: audience.foreground_image_path,
    foregroundClass: audience.foreground_class,
    accentColor: audience.accent_color,
  }
}

function toPost(row, audiencesById, audienceLinksByPostId, linksByPostId, optionsById, groups) {
  const primaryAudience = audiencesById.get(row.audience_id)
  const linkedAudiences = (audienceLinksByPostId.get(row.id) || [])
    .map((audienceId) => audiencesById.get(audienceId))
    .filter(Boolean)
  const postAudiences = linkedAudiences.length > 0
    ? linkedAudiences
    : primaryAudience
      ? [primaryAudience]
      : []
  const post = {
    id: row.id,
    audienceId: row.audience_id,
    audiences: postAudiences.map((audience) => ({
      id: audience.id,
      slug: audience.slug,
      name: audience.name,
      categoryPath: audience.category_path,
      imagePath: audience.image_path,
      accentColor: audience.accent_color,
    })),
    audienceNames: postAudiences.map((audience) => audience.name),
    title: row.title,
    intro: row.intro,
    content: row.content,
    slug: row.slug,
    path: `/blog/${row.slug}`,
    status: row.status,
    publishedAt: row.published_at,
    ...(primaryAudience ? toCategory(primaryAudience) : {}),
  }

  groups.forEach((group) => {
    post[group.key] = []
  })

  ;(linksByPostId.get(row.id) || []).forEach((optionId) => {
    const option = optionsById.get(optionId)
    if (option?.groupKey) {
      post[option.groupKey] = [...(post[option.groupKey] || []), option.label]
    }
  })

  return post
}

function toSiteContent(rows = []) {
  return Object.fromEntries(
    Object.entries(defaultSiteContent).map(([key, fallback]) => {
      const row = rows.find((item) => item.page_key === fallback.pageKey)
      return [
        key,
        {
          ...fallback,
          title: row?.title || fallback.title,
          body: row?.body || fallback.body,
        },
      ]
    }),
  )
}

export function isConfigured() {
  return isSupabaseConfigured
}

export async function getSession() {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.session
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function fetchBlogData() {
  if (!supabase) {
    throw new Error('Supabase is nog niet geconfigureerd.')
  }

  const [
    audiencesResult,
    groupsResult,
    optionsResult,
    postsResult,
    linksResult,
    audienceLinksResult,
    siteContentResult,
  ] = await Promise.all([
    supabase.from('blog_audiences').select('*').order('sort_order'),
    supabase.from('blog_filter_groups').select('*').order('sort_order'),
    supabase.from('blog_filter_options').select('*').order('sort_order'),
    supabase.from('blog_posts').select('*').order('published_at', { ascending: false }).order('created_at', { ascending: false }),
    supabase.from('blog_post_filter_options').select('*'),
    supabase.from('blog_post_audiences').select('*').order('sort_order'),
    supabase.from('site_page_content').select('page_key, title, body'),
  ])

  const error = audiencesResult.error || groupsResult.error || optionsResult.error || postsResult.error || linksResult.error
  if (error) throw error
  const audienceLinksTableMissing = ['42P01', 'PGRST205'].includes(audienceLinksResult.error?.code)
  if (audienceLinksResult.error && !audienceLinksTableMissing) throw audienceLinksResult.error
  const siteContentTableMissing = ['42P01', 'PGRST205'].includes(siteContentResult.error?.code)
  if (siteContentResult.error && !siteContentTableMissing) throw siteContentResult.error

  const audiences = audiencesResult.data || []
  const rawGroups = groupsResult.data || []
  const rawOptions = optionsResult.data || []
  const links = linksResult.data || []
  const audienceLinks = audienceLinksResult.data || []

  const groups = rawGroups.map((group) => {
    const optionRecords = rawOptions
      .filter((option) => option.group_id === group.id)
      .map((option) => ({
        id: option.id,
        groupId: option.group_id,
        slug: option.slug,
        label: option.label,
        sortOrder: option.sort_order,
      }))

    return {
      id: group.id,
      key: group.key,
      label: group.label,
      sortOrder: group.sort_order,
      options: optionRecords.map((option) => option.label),
      optionRecords,
    }
  })

  const audiencesById = new Map(audiences.map((audience) => [audience.id, audience]))
  const optionsById = new Map()
  groups.forEach((group) => {
    group.optionRecords.forEach((option) => {
      optionsById.set(option.id, { ...option, groupKey: group.key })
    })
  })

  const linksByPostId = new Map()
  links.forEach((link) => {
    const current = linksByPostId.get(link.post_id) || []
    linksByPostId.set(link.post_id, [...current, link.filter_option_id])
  })

  const audienceLinksByPostId = new Map()
  audienceLinks.forEach((link) => {
    const current = audienceLinksByPostId.get(link.post_id) || []
    audienceLinksByPostId.set(link.post_id, [...current, link.audience_id])
  })

  return {
    audiences,
    filterGroups: groups,
    posts: (postsResult.data || []).map((post) =>
      toPost(post, audiencesById, audienceLinksByPostId, linksByPostId, optionsById, groups),
    ),
    audienceLinksTableMissing,
    siteContent: toSiteContent(siteContentResult.data),
    siteContentTableMissing,
  }
}

export async function saveBlogPost(article, originalPath, currentPosts, audiences, filterGroups) {
  const selectedAudiences = (article.audiences || [])
    .map((audienceName) => audiences.find((item) => item.name === audienceName))
    .filter(Boolean)
  if (selectedAudiences.length === 0) throw new Error('Kies minstens één doelgroep voor dit artikel.')
  const primaryAudience = selectedAudiences.find((item) => item.name === article.category) || selectedAudiences[0]
  const audienceTableCheck = await supabase.from('blog_post_audiences').select('post_id').limit(1)
  if (audienceTableCheck.error?.code === 'PGRST205' || audienceTableCheck.error?.code === '42P01') {
    throw new Error('Voer eerst de migratie voor meerdere blogdoelgroepen uit in Supabase.')
  }
  if (audienceTableCheck.error) throw audienceTableCheck.error

  let slug = article.slug || article.path?.replace('/blog/', '') || ''
  if (!slug) {
    const baseSlug = article.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `artikel-${Date.now()}`
    const usedSlugs = new Set(currentPosts.map((post) => post.slug))
    slug = baseSlug
    let counter = 2
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${counter}`
      counter += 1
    }
  }

  const existing = article.id || currentPosts.find((post) => post.path === originalPath || post.path === article.path)?.id
  const payload = {
    audience_id: primaryAudience.id,
    slug,
    title: article.title.trim(),
    intro: article.intro.trim(),
    content: article.content.trim(),
    status: 'published',
    published_at: existing ? article.publishedAt : new Date().toISOString(),
  }

  const postResult = existing
    ? await supabase.from('blog_posts').update(payload).eq('id', existing).select('id').single()
    : await supabase.from('blog_posts').insert(payload).select('id').single()

  if (postResult.error) throw postResult.error
  const postId = postResult.data.id

  const deleteAudienceLinksResult = await supabase.from('blog_post_audiences').delete().eq('post_id', postId)
  if (deleteAudienceLinksResult.error?.code === 'PGRST205' || deleteAudienceLinksResult.error?.code === '42P01') {
    throw new Error('Voer eerst de migratie voor meerdere blogdoelgroepen uit in Supabase.')
  }
  if (deleteAudienceLinksResult.error) throw deleteAudienceLinksResult.error

  const insertAudienceLinksResult = await supabase.from('blog_post_audiences').insert(
    selectedAudiences.map((audience, index) => ({
      post_id: postId,
      audience_id: audience.id,
      sort_order: index + 1,
    })),
  )
  if (insertAudienceLinksResult.error) throw insertAudienceLinksResult.error

  const selectedOptionIds = []
  filterGroups.forEach((group) => {
    const selectedLabels = article[group.key] || []
    selectedLabels.forEach((label) => {
      const option = group.optionRecords?.find((record) => record.label === label)
      if (option) selectedOptionIds.push(option.id)
    })
  })

  const deleteResult = await supabase.from('blog_post_filter_options').delete().eq('post_id', postId)
  if (deleteResult.error) throw deleteResult.error

  if (selectedOptionIds.length > 0) {
    const insertResult = await supabase.from('blog_post_filter_options').insert(
      selectedOptionIds.map((filterOptionId) => ({
        post_id: postId,
        filter_option_id: filterOptionId,
      })),
    )
    if (insertResult.error) throw insertResult.error
  }

  return `/blog/${slug}`
}

export async function deleteBlogPost(postId) {
  if (!postId) throw new Error('Dit artikel kon niet gevonden worden.')
  const { error } = await supabase.from('blog_posts').delete().eq('id', postId)
  if (error) throw error
}

export async function deleteFilterOption(optionId) {
  if (!optionId) throw new Error('Deze filteroptie kon niet gevonden worden.')
  const { error } = await supabase.from('blog_filter_options').delete().eq('id', optionId)
  if (error) throw error
}

export async function deleteFilterGroup(groupId) {
  if (!groupId) throw new Error('Deze filtercategorie kon niet gevonden worden.')
  const { error } = await supabase.from('blog_filter_groups').delete().eq('id', groupId)
  if (error) throw error
}

export async function saveFilters(groups) {
  const savedGroups = []

  for (const [groupIndex, group] of groups.entries()) {
    const groupPayload = {
      key: group.key,
      label: group.label.trim() || 'Nieuwe filter',
      sort_order: groupIndex + 1,
    }

    const groupResult = group.id
      ? await supabase.from('blog_filter_groups').update(groupPayload).eq('id', group.id).select('*').single()
      : await supabase.from('blog_filter_groups').insert(groupPayload).select('*').single()

    if (groupResult.error) throw groupResult.error
    const savedGroup = groupResult.data
    savedGroups.push(savedGroup)

    const uniqueOptions = []
    group.options.forEach((option) => {
      const trimmed = option.trim()
      if (trimmed && !uniqueOptions.includes(trimmed)) uniqueOptions.push(trimmed)
    })

    for (const [optionIndex, optionLabel] of uniqueOptions.entries()) {
      const existingOption = group.optionRecords?.[optionIndex] || group.optionRecords?.find((option) => option.label === optionLabel)
      const optionPayload = {
        group_id: savedGroup.id,
        slug: optionLabel
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || `optie-${Date.now()}`,
        label: optionLabel,
        sort_order: optionIndex + 1,
      }

      const optionResult = existingOption?.id
        ? await supabase.from('blog_filter_options').update(optionPayload).eq('id', existingOption.id)
        : await supabase.from('blog_filter_options').insert(optionPayload)

      if (optionResult.error) throw optionResult.error
    }
  }

  return savedGroups
}

export async function saveSiteContent(siteContent) {
  if (!supabase) {
    throw new Error('Supabase is nog niet geconfigureerd.')
  }

  const rows = Object.values(siteContent).map((page) => ({
    page_key: page.pageKey,
    title: page.title.trim(),
    body: page.body.trim(),
  }))

  const { error } = await supabase
    .from('site_page_content')
    .upsert(rows, { onConflict: 'page_key' })

  if (error?.code === 'PGRST205' || error?.code === '42P01') {
    throw new Error('Voer eerst de nieuwe site_page_content-migratie uit in Supabase.')
  }
  if (error) throw error
}
