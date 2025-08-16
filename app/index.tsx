import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
  View,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import PokemonCard from '../components/PokemonCard';
import TypeFilterBar from '../components/TypeFilterBar';
import { fetchAllTypes, fetchPokemonList, PokemonListItem } from '../lib/pokeApi';
import { LinearGradient } from 'expo-linear-gradient';

const SkeletonCard = () => {
  return (
    <View className="m-2 flex-1 overflow-hidden rounded-2xl bg-gray-200">
      <LinearGradient colors={['#eee', '#ddd']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <View className="items-center p-4">
          <View className="my-4 h-[120px] w-[120px] rounded-full bg-gray-300" />
          <View className="mt-2 h-4 w-24 rounded bg-gray-400" />
          <View className="mt-1 h-3 w-12 rounded bg-gray-400" />
          <View className="mt-2 flex-row">
            <View className="mr-2 h-4 w-16 rounded-full bg-gray-400" />
            <View className="h-4 w-16 rounded-full bg-gray-400" />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default function Home() {
  const router = useRouter();
  const [types, setTypes] = useState<string[]>([]);
  const [active, setActive] = useState<Set<string>>(new Set());
  const [data, setData] = useState<PokemonListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const TOTAL = 1000;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setError(null);
    try {
      const t = await fetchAllTypes();
      setTypes(t);
      await fetchPokemonList((batch) => {
        setData((prev) => [...prev, ...batch].sort((a, b) => a.id - b.id));
      });
    } catch (e) {
      setError(`Failed to load data. Check your connection or try again. ${e}`);
    }
  };

  const filtered = useMemo(() => {
    if (active.size === 0) return data;
    return data.filter((p) => Array.from(active).every((t) => p.types.includes(t)));
  }, [data, active]);

  const toggleType = (t: string) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setData([]);
    await loadData();
    setRefreshing(false);
  };

  const isLoading = data.length === 0 && !error;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pb-2 pt-4">
        <Text className="text-2xl font-extrabold">Welcome to the PokeApi App!</Text>
      </View>

      <TypeFilterBar types={types} active={active} onToggle={toggleType} />

      {error ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-500">{error}</Text>
          <TouchableOpacity onPress={loadData} className="mt-2 rounded bg-blue-500 px-4 py-2">
            <Text className="text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={isLoading ? Array(12).fill(null) : filtered}
          keyExtractor={(item, idx) => (item ? String(item.id) : `skel-${idx}`)}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 24 }}
          renderItem={({ item }) =>
            item ? (
              <PokemonCard
                id={item.id}
                name={item.name}
                image={item.image}
                types={item.types}
                onPress={() => router.push({ pathname: '/[id]', params: { id: String(item.id) } })}
              />
            ) : (
              <SkeletonCard />
            )
          }
          ListFooterComponent={
            data.length < TOTAL && !isLoading ? (
              <View className="items-center py-4">
                <ActivityIndicator />
                <Text>
                  Loading more Pokémon... ({data.length}/{TOTAL})
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            !isLoading ? (
              <View className="mt-10 items-center">
                <Text className="text-gray-500">No Pokémon match selected types.</Text>
              </View>
            ) : null
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={5}
        />
      )}
    </SafeAreaView>
  );
}
