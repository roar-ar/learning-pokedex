export function isFavoriteIds(value) {
  return Array.isArray(value)
    && value.every((id) => Number.isInteger(id) && id >= 1 && id <= 10)
    && new Set(value).size === value.length
}
