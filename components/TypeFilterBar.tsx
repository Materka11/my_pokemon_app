import { ScrollView, View } from 'react-native';
import Pill from './TypePill';

interface Props {
  types: string[];
  active: Set<string>;
  onToggle: (type: string) => void;
}

export default function TypeFilterBar({ types, active, onToggle }: Props) {
  return (
    <View className="mb-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 4 }}>
        {types.map((t) => (
          <Pill key={t} type={t} selected={active.has(t)} onToggle={onToggle} />
        ))}
      </ScrollView>
    </View>
  );
}
