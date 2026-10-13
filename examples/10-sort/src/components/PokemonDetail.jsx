import typeNames from '../data/typeNames.ja.json'
import abilityNames from '../data/abilityNames.ja.json'
import statNames from '../data/statNames.ja.json'

export default function PokemonDetail({ pokemon, onBack }) {
  const imageUrl = pokemon.sprites.other['official-artwork'].front_default

  return (
    <section>
      <button className="back-button" type="button" onClick={onBack} autoFocus>
        一覧に戻る
      </button>
      <article className="pokemon-detail">
        <img className="pokemon-image" src={imageUrl} alt={pokemon.nameja} />
        <h2>{pokemon.nameja}</h2>
        <p>図鑑番号: {pokemon.id}</p>
        <p>タイプ: {pokemon.types.map((entry) => typeNames[entry.type.name]).join(' / ')}</p>
        <h3>基本情報</h3>
        <dl className="pokemon-facts">
          <div><dt>高さ</dt><dd>{pokemon.height / 10} m</dd></div>
          <div><dt>重さ</dt><dd>{pokemon.weight / 10} kg</dd></div>
        </dl>
        <h3>特性</h3>
        <ul>
          {pokemon.abilities.map((entry) => (
            <li key={entry.ability.name}>
              {abilityNames[entry.ability.name]}
              {entry.is_hidden && '（隠れ特性）'}
            </li>
          ))}
        </ul>
        <h3>ステータス</h3>
        <dl className="pokemon-stats">
          {pokemon.stats.map((entry) => (
            <div key={entry.stat.name}>
              <dt>{statNames[entry.stat.name]}</dt>
              <dd>{entry.base_stat}</dd>
            </div>
          ))}
        </dl>
      </article>
    </section>
  )
}
