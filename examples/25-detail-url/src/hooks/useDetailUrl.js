import { useEffect, useState } from 'react'
import { readDetailUrl, writeDetailUrl } from '../utils/detailUrl.js'

export default function useDetailUrl() {
  const [detail, setDetail] = useState(readDetailUrl)

  useEffect(() => {
    function restore() {
      setDetail(readDetailUrl())
    }
    window.addEventListener('popstate', restore)
    return () => window.removeEventListener('popstate', restore)
  }, [])

  function openDetail(id) {
    writeDetailUrl(id)
    setDetail(readDetailUrl())
  }

  function closeDetail() {
    writeDetailUrl(null)
    setDetail(readDetailUrl())
  }

  return { ...detail, openDetail, closeDetail }
}
