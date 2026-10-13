import typeNames from '../data/typeNames.ja.json'

export default function FilterControls({ query, onQueryChange, selectedType, onTypeChange, sortOrder, onSortChange }) {
  return (
      <div className="filter-controls">
        <label className="filter-field" htmlFor="name-search">
          名前
          <input
            id="name-search"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </label>
        <label className="filter-field" htmlFor="type-filter">
          タイプ
          <select id="type-filter" value={selectedType} onChange={(event) => onTypeChange(event.target.value)}>
            <option value="">すべて</option>
            {Object.keys(typeNames).map((type) => (
              <option key={type} value={type}>{typeNames[type]}</option>
            ))}
          </select>
        </label>
        <label className="filter-field" htmlFor="sort-order">
          並び順
          <select id="sort-order" value={sortOrder} onChange={(event) => onSortChange(event.target.value)}>
            <option value="asc">図鑑番号が小さい順</option>
            <option value="desc">図鑑番号が大きい順</option>
          </select>
        </label>
      </div>
  )
}
