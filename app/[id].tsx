import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { fetchPokemonDetail, PokemonDetail } from '../lib/pokeApi';
import { getTypeGradient } from '../constants/typeColors';
import { LinearGradient } from 'expo-linear-gradient';

const SkeletonDetail = () => {
  return (
    <View className="flex-1 bg-white">
      <LinearGradient colors={['#ddd', '#ccc']}>
        <View className="items-center px-5 pb-6 pt-8">
          <View className="mb-1 h-6 w-32 rounded bg-gray-300" />
          <View className="h-4 w-16 rounded bg-gray-300" />
          <View className="w-180 h-180 mt-4 rounded-full bg-gray-200" />
        </View>
      </LinearGradient>
      <View className="px-5 py-4">
        <View className="mb-2 h-5 w-20 rounded bg-gray-300" />
        {Array(6)
          .fill(null)
          .map((_, i) => (
            <View key={i} className="flex-row justify-between py-1">
              <View className="h-4 w-24 rounded bg-gray-200" />
              <View className="h-4 w-12 rounded bg-gray-200" />
            </View>
          ))}
      </View>
    </View>
  );
};

export default function Details() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [detail, setDetail] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const d = await fetchPokemonDetail(Number(id));
        setDetail(d);
      } catch (e) {
        setError(`Failed to load details. ${e}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <SkeletonDetail />;
  if (error)
    return (
      <View className="flex-1 items-center justify-center">
        <Text>{error}</Text>
      </View>
    );
  if (!detail) return null;

  const [c1, c2] = getTypeGradient(detail.types);

  return (
    <ScrollView className="flex-1 bg-white">
      <LinearGradient colors={[c1, c2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <View className="px-5 pb-6 pt-8">
          <Text className="text-3xl font-extrabold capitalize text-white">{detail.name}</Text>
          <Text className="font-semibold text-white/90">#{String(detail.id).padStart(3, '0')}</Text>
          <View className="mt-2 flex-row">
            {detail.types.map((t) => (
              <View key={t} className="mr-2 rounded-full bg-white/25 px-2 py-1">
                <Text className="text-xs capitalize text-white">{t}</Text>
              </View>
            ))}
          </View>
          <View className="mt-4 items-center">
            <Image
              source={{ uri: detail.image }}
              style={{ width: 180, height: 180 }}
              resizeMode="contain"
              defaultSource={{
                uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
              }}
            />
          </View>
        </View>
      </LinearGradient>

      <View className="px-5 py-4">
        <Text className="mb-2 text-xl font-bold">Stats</Text>
        <View className="rounded-2xl bg-gray-100 p-3">
          {detail.stats.map((s) => (
            <View key={s.name} className="flex-row justify-between py-1">
              <Text className="capitalize">{s.name.replace('-', ' ')}</Text>
              <Text className="font-semibold">{s.value}</Text>
            </View>
          ))}
        </View>

        <Text className="mb-2 mt-4 text-xl font-bold">Abilities</Text>
        <View className="flex-row flex-wrap">
          {detail.abilities.map((a) => (
            <View key={a} className="mb-2 mr-2 rounded-full bg-black/5 px-3 py-1">
              <Text className="capitalize">{a.replace('-', ' ')}</Text>
            </View>
          ))}
        </View>

        <Text className="mb-2 mt-4 text-xl font-bold">Sprites</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {detail.sprites.map((s, idx) => (
            <Image
              key={s + idx}
              source={{ uri: s }}
              style={{ width: 96, height: 96, marginRight: 8 }}
              resizeMode="contain"
            />
          ))}
        </ScrollView>

        <Text className="mb-2 mt-4 text-xl font-bold">Evolutions</Text>
        <View className="flex-row flex-wrap">
          {detail.evolutions.map((e) => (
            <View key={e} className="mb-2 mr-2 rounded-full bg-black/5 px-3 py-1">
              <Text className="capitalize">{e}</Text>
            </View>
          ))}
        </View>

        <Text className="mb-2 mt-4 text-xl font-bold">Locations</Text>
        <View className="flex-row flex-wrap">
          {detail.locations.slice(0, 10).map((l) => (
            <View key={l} className="mb-2 mr-2 rounded-full bg-black/5 px-3 py-1">
              <Text className="capitalize">{l.replace('-', ' ')}</Text>
            </View>
          ))}
        </View>

        <View className="h-8" />
      </View>
    </ScrollView>
  );
}
