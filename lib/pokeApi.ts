import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PokemonListItem {
  id: number;
  name: string;
  image: string;
  types: string[];
}

export interface PokemonDetail extends PokemonListItem {
  height: number;
  weight: number;
  sprites: string[];
  abilities: string[];
  stats: { name: string; value: number }[];
  evolutions: string[];
  locations: string[];
}

const BASE = 'https://pokeapi.co/api/v2';
const LIMIT = 1000;
const CACHE_KEY = 'pokemon_list_cache';
const POKEMON_TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
];

function extractIdFromUrl(url: string): number {
  const match = url.match(/\/pokemon\/(\d+)\//);
  return match ? Number(match[1]) : 0;
}

export async function fetchAllTypes(): Promise<string[]> {
  const res = await fetch(`${BASE}/type`);
  const { results } = await res.json();
  const names = (results as { name: string }[]).map((t) => t.name);
  return names.filter((n) => POKEMON_TYPES.includes(n));
}

export async function fetchPokemonList(
  onProgress: (batch: PokemonListItem[]) => void
): Promise<PokemonListItem[]> {
  const cached = await AsyncStorage.getItem(CACHE_KEY);
  if (cached) {
    const parsed = JSON.parse(cached);
    onProgress(parsed);
    return parsed;
  }

  const res = await fetch(`${BASE}/pokemon?limit=${LIMIT}`);
  const { results } = await res.json();
  const list = results as { name: string; url: string }[];

  const concurrency = 10;
  const chunks: { name: string; url: string }[][] = [];
  for (let i = 0; i < list.length; i += concurrency) {
    chunks.push(list.slice(i, i + concurrency));
  }

  const result: PokemonListItem[] = [];

  for (const chunk of chunks) {
    const details = await Promise.all(
      chunk.map(async (it) => {
        try {
          const id = extractIdFromUrl(it.url);
          const d = await fetch(`${BASE}/pokemon/${id}`).then((r) => r.json());
          const types = (d.types as any[]).map((t) => t.type.name as string);
          const image =
            d.sprites.other?.['official-artwork']?.front_default ||
            d.sprites.front_default ||
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
          return { id, name: d.name, image, types } as PokemonListItem;
        } catch {
          return null;
        }
      })
    );
    const valid = details.filter(Boolean) as PokemonListItem[];
    result.push(...valid);
    onProgress(valid);
    await new Promise((r) => setTimeout(r, 500));
  }

  result.sort((a, b) => a.id - b.id);
  if (result.length === 0) {
    throw new Error('Failed to fetch any Pokémon data. Possible network or API issue.');
  }
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(result));
  return result;
}

export async function fetchPokemonDetail(id: number): Promise<PokemonDetail> {
  const d = await fetch(`${BASE}/pokemon/${id}`).then((r) => r.json());

  const sprites: string[] = Array.from(
    new Set(
      [
        d.sprites.front_default,
        d.sprites.back_default,
        d.sprites.front_shiny,
        d.sprites.back_shiny,
        d.sprites.other?.['official-artwork']?.front_default,
      ].filter(Boolean)
    )
  );

  const types = (d.types as any[]).map((t) => t.type.name as string);
  const abilities = (d.abilities as any[]).map((a) => a.ability.name as string);
  const stats = (d.stats as any[]).map((s) => ({
    name: s.stat.name as string,
    value: s.base_stat as number,
  }));

  const species = await fetch(`${BASE}/pokemon-species/${id}`).then((r) => r.json());
  const evoChainUrl = species.evolution_chain.url;
  const evoChain = await fetch(evoChainUrl).then((r) => r.json());
  const evolutions = extractEvolutions(evoChain.chain);

  const encounters = await fetch(`${BASE}/pokemon/${id}/encounters`).then((r) => r.json());
  const locations = encounters.map((e: any) => e.location_area.name);

  const detail: PokemonDetail = {
    id: d.id,
    name: d.name,
    image:
      d.sprites.other?.['official-artwork']?.front_default ||
      d.sprites.front_default ||
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
    types,
    height: d.height,
    weight: d.weight,
    sprites,
    abilities,
    stats,
    evolutions,
    locations,
  };

  return detail;
}

function extractEvolutions(chain: any): string[] {
  const evos: string[] = [chain.species.name];

  if (chain.evolves_to?.length) {
    chain.evolves_to.forEach((next: any) => {
      evos.push(...extractEvolutions(next));
    });
  }

  return evos;
}
