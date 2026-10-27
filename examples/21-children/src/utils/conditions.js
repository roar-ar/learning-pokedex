export function createDefaultConditions() {
  return { query: '', selectedTypes: [], typeMatch: 'any', sortOrder: 'asc' }
}

export function copyConditions(conditions) {
  return { ...conditions, selectedTypes: [...conditions.selectedTypes] }
}
