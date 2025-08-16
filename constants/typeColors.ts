export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

export function getTypeGradient(types: string[]): string[] {
  if (types.length === 0) return ['#ddd', '#ccc'];

  const t1 = types[0]?.toLowerCase();
  const c1 = TYPE_COLORS[t1] ?? '#bbb';

  if (types.length === 1) return [c1, c1];

  const t2 = types[1]?.toLowerCase();
  const c2 = TYPE_COLORS[t2] ?? '#aaa';

  return [c1, c2];
}
