import typeNames from '../data/typeNames.ja.json'
import FavoriteButton from './FavoriteButton.jsx'
import abilityNames from '../data/abilityNames.ja.json'
import statNames from '../data/statNames.ja.json'
import StatBar, { STAT_SCALE } from './StatBar.jsx'
import InfoPanel from './InfoPanel.jsx'

export default function PokemonDetail({ pokemon, onBack }) {
  const imageUrl = pokemon.sprites.other['official-artwork'].front_default

  return (
    <section>
      <button className="back-button" type="button" onClick={onBack} autoFocus>
        一覧に戻る
      </button>
      <article className="pokemon-detail">
        <img className="pokemon-image" src={imageUrl} alt={pokemon.name} />
        <h2>{pokemon.name}</h2>
        <FavoriteButton pokemonId={pokemon.id} pokemonName={pokemon.name} />
        <p>図鑑番号: {pokemon.id}</p>
        <p>タイプ: {pokemon.types.map((entry) => typeNames[entry.type.name]).join(' / ')}</p>
        <h3>基本情報</h3>
        <dl className="pokemon-facts">
          <div><dt>高さ</dt><dd>{pokemon.height / 10} m</dd></div>
          <div><dt>重さ</dt><dd>{pokemon.weight / 10} kg</dd></div>
        </dl>
        <InfoPanel title="特性">
        <ul>
          {pokemon.abilities.map((entry) => (
            <li key={entry.ability.name}>
              {abilityNames[entry.ability.name]}
              {entry.is_hidden && '（隠れ特性）'}
            </li>
          ))}
        </ul>
        </InfoPanel>
        <InfoPanel title="ステータス">
        <p>表示幅の基準: {STAT_SCALE}（種族ごとの基本値）</p>
        <dl className="pokemon-stats">
          {pokemon.stats.map((entry) => (
            <StatBar key={entry.stat.name} label={statNames[entry.stat.name]} value={entry.base_stat} />
          ))}
        </dl>
        </InfoPanel>
      </article>
    </section>
  )
}
