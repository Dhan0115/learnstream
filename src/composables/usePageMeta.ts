/**
 * Per-view document metadata (design_spec.md §4.8).
 *
 * The site is a single-page application, so the head tags are set from the
 * client: `document.title` and the `description` meta tag are what a crawler
 * reads once the view has rendered. Every route carries a title and a
 * description in its route meta, and a view whose content comes from the API
 * (a lesson, a search, a subject) replaces them once that content has loaded.
 */

const SITE_NAME = 'LearnStream'

/** Search engines show roughly this much of a description before truncating. */
const DESCRIPTION_LIMIT = 160

const DEFAULT_DESCRIPTION =
  'Learn any subject through clear, engaging video lessons — maths, science, programming, history, languages and more.'

/** Collapse whitespace and cut long text at a word-safe boundary. */
function clip(text: string, limit = DESCRIPTION_LIMIT): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= limit) return clean

  const cut = clean.slice(0, limit - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

/** The description tag, created once if the document shell does not carry one. */
function descriptionTag(): HTMLMetaElement {
  const existing = document.head.querySelector<HTMLMetaElement>('meta[name="description"]')
  if (existing) return existing

  const tag = document.createElement('meta')
  tag.name = 'description'
  tag.content = DEFAULT_DESCRIPTION
  document.head.appendChild(tag)
  return tag
}

/**
 * Point the document title and description at the view that is on screen.
 * A `title` of `''` falls back to the site name alone.
 */
export function setPageMeta(title: string, description = ''): void {
  document.title = title ? `${title} · ${SITE_NAME}` : SITE_NAME
  descriptionTag().content = clip(description || DEFAULT_DESCRIPTION)
}

/**
 * Apply the metadata a route declares in its `meta` block. The router runs this
 * after every navigation; a view with content of its own calls `setPageMeta`
 * again once that content arrives, so the specific title always wins.
 */
export function applyRouteMeta(meta: Record<string, unknown>): void {
  setPageMeta(
    typeof meta.title === 'string' ? meta.title : '',
    typeof meta.description === 'string' ? meta.description : ''
  )
}
