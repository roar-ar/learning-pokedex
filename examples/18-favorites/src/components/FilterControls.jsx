import typeNames from '../data/typeNames.ja.json'

export default function FilterControls({
  query, onQueryChange,
  selectedTypes, onTypeToggle,
  typeMatch, onTypeMatchChange,
  sortOrder, onSortChange,
}) {
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
        <fieldset className="type-options">
          <legend>タイプ（未選択ならすべて）</legend>
          <div className="type-options-grid">
            {Object.keys(typeNames).map((type) => (
              <label className="type-option" key={type}>
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => onTypeToggle(type)}
                />
                {typeNames[type]}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="filter-field" htmlFor="type-match">
          タイプの一致方法
          <select id="type-match" value={typeMatch} onChange={(event) => onTypeMatchChange(event.target.value)}>
            <option value="any">いずれかに一致</option>
            <option value="all">すべてに一致</option>
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
