import { createDefaultConditions, copyConditions } from '../utils/conditions.js'

export function createInitialCatalogState() {
  return { conditions: createDefaultConditions(), draft: createDefaultConditions(), page: 1 }
}

export function catalogReducer(state, action) {
  switch (action.type) {
    case 'filters_opened':
      return { ...state, draft: copyConditions(state.conditions) }
    case 'draft_changed':
      return { ...state, draft: { ...state.draft, ...action.changes } }
    case 'type_toggled': {
      const types = state.draft.selectedTypes
      const selectedTypes = types.includes(action.value)
        ? types.filter((value) => value !== action.value)
        : [...types, action.value]
      return { ...state, draft: { ...state.draft, selectedTypes } }
    }
    case 'draft_reset':
      return { ...state, draft: createDefaultConditions() }
    case 'filters_cancelled':
      return { ...state, draft: copyConditions(state.conditions) }
    case 'filters_applied':
      return { ...state, conditions: copyConditions(state.draft), page: 1 }
    case 'page_changed':
      return { ...state, page: Math.max(1, action.page) }
    case 'restored':
      return {
        conditions: copyConditions(action.state.conditions),
        draft: copyConditions(action.state.conditions),
        page: action.state.page,
      }
    default:
      throw new Error('未対応の操作: ' + action.type)
  }
}
