import { memo } from 'react';
import { Pressable, Text, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getTypeGradient } from '../constants/typeColors';

type Props = {
  id: number;
  name: string;
  image: string;
  types: string[];
  onPress: () => void;
};

function PokemonCard({ id, name, image, types, onPress }: Props) {
  const [c1, c2] = getTypeGradient(types);

  return (
    <Pressable onPress={onPress} className="m-2 flex-1 overflow-hidden rounded-2xl">
      <LinearGradient colors={[c1, c2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <View className="items-center p-4">
          <View className="my-4 items-center justify-center">
            <Image
              source={{ uri: image }}
              style={{ width: 120, height: 120 }}
              resizeMode="contain"
              defaultSource={{
                uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
              }}
            />
          </View>
          <Text className="text-center text-lg font-bold capitalize text-white">{name}</Text>
          <Text className="text-center text-sm font-semibold text-white/90">
            #{String(id).padStart(3, '0')}
          </Text>
          <View className="mt-2 flex-row justify-center">
            {types.map((t) => (
              <View key={t} className="mr-2 rounded-full bg-white px-3 py-1">
                <Text className="text-xs capitalize text-black">{t}</Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export default memo(PokemonCard);
