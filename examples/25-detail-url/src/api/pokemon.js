function readCache(key) {
  try {
    const value = sessionStorage.getItem(key)
    return value === null ? null : JSON.parse(value)
  } catch {
    return null
  }
}

function writeCache(key, pokemon) {
  try {
    sessionStorage.setItem(key, JSON.stringify(pokemon))
  } catch {
    // 保存できない環境でも、取得したデータは表示に使えます。
  }
}

function pickPokemon(data) {
  return {
    id: data.id,
    name: data.name,
    height: data.height,
    weight: data.weight,
    types: data.types,
    abilities: data.abilities,
    stats: data.stats,
    sprites: {
      other: {
        'official-artwork': {
          front_default: data.sprites.other['official-artwork'].front_default,
        },
      },
    },
  }
}

export async function fetchPokemon(id, signal) {
  const cacheKey = 'pokedex:pokemon:' + id
  const cached = readCache(cacheKey)
  if (cached) return cached

  const response = await fetch('https://pokeapi.co/api/v2/pokemon/' + id + '/', { signal })
  if (!response.ok) throw new Error('HTTP ' + response.status)
  const data = await response.json()
  const pokemon = pickPokemon(data)
  writeCache(cacheKey, pokemon)
  return pokemon
}
