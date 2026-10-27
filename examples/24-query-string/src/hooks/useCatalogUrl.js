import { useEffect } from 'react'
import { catalogReducer } from '../state/catalogReducer.js'
import { readCatalogUrl, writeCatalogUrl } from '../utils/catalogUrl.js'

export default function useCatalogUrl({ catalog, dispatch, currentPage, loading, error, dialogRef, onNavigate }) {
  const { conditions, page } = catalog

  useEffect(() => {
    function restore() {
      dialogRef.current?.close()
      dispatch({ type: 'restored', state: readCatalogUrl() })
      onNavigate?.(null)
    }
    window.addEventListener('popstate', restore)
    return () => window.removeEventListener('popstate', restore)
  }, [dispatch, dialogRef, onNavigate])

  useEffect(() => {
    if (loading || error) return
    if (page !== currentPage) dispatch({ type: 'page_changed', page: currentPage })
    writeCatalogUrl({ conditions, page: currentPage }, 'replace')
  }, [conditions, page, currentPage, loading, error, dispatch])

  function commit(action) {
    const next = catalogReducer(catalog, action)
    writeCatalogUrl(next, 'push')
    dispatch(action)
  }

  return commit
}
