import typeNames from '../data/typeNames.ja.json'
import { copyConditions } from './conditions.js'

const CATALOG_KEYS = ['q', 'types', 'match', 'sort', 'page']

export function readCatalogUrl(search = window.location.search) {
  const params = new URLSearchParams(search)
  const pageText = params.get('page') || '1'
  const parsedPage = /^[1-9]\d*$/.test(pageText) ? Number(pageText) : 1
  const page = Number.isSafeInteger(parsedPage) ? parsedPage : 1
  const conditions = {
    query: (params.get('q') || '').trim(),
    selectedTypes: [...new Set(params.getAll('types').filter((type) => Object.hasOwn(typeNames, type)))],
    typeMatch: params.get('match') === 'all' ? 'all' : 'any',
    sortOrder: params.get('sort') === 'desc' ? 'desc' : 'asc',
  }
  return { conditions, draft: copyConditions(conditions), page }
}

export function encodeCatalog({ conditions, page }) {
  const params = new URLSearchParams()
  if (conditions.query.trim()) params.set('q', conditions.query.trim())
  for (const type of conditions.selectedTypes) params.append('types', type)
  if (conditions.typeMatch === 'all') params.set('match', 'all')
  if (conditions.sortOrder === 'desc') params.set('sort', 'desc')
  if (page > 1) params.set('page', String(page))
  return params
}

export function writeCatalogUrl(state, mode = 'push') {
  const url = new URL(window.location.href)
  for (const key of CATALOG_KEYS) url.searchParams.delete(key)
  for (const [key, value] of encodeCatalog(state)) url.searchParams.append(key, value)
  const target = url.pathname + url.search + url.hash
  const current = window.location.pathname + window.location.search + window.location.hash
  if (target === current) return
  if (mode === 'replace') window.history.replaceState(null, '', target)
  else window.history.pushState(null, '', target)
}
