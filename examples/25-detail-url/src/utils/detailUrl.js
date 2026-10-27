export function readDetailUrl(search = window.location.search) {
  const params = new URLSearchParams(search)
  const value = params.get('pokemon')
  if (value === null) return { selectedId: null, detailError: '' }
  const id = /^[1-9]\d*$/.test(value) ? Number(value) : NaN
  if (!Number.isInteger(id) || id < 1 || id > 10) {
    return { selectedId: null, detailError: 'この図鑑では番号1〜10の詳細を表示できます。' }
  }
  return { selectedId: id, detailError: '' }
}

export function detailHref(id) {
  const url = new URL(window.location.href)
  if (id === null) url.searchParams.delete('pokemon')
  else url.searchParams.set('pokemon', String(id))
  return url.pathname + url.search + url.hash
}

export function writeDetailUrl(id) {
  const target = detailHref(id)
  const current = window.location.pathname + window.location.search + window.location.hash
  if (target !== current) window.history.pushState(null, '', target)
}
