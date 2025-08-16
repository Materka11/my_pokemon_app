import { memo } from 'react';
import { Pressable, Text } from 'react-native';
import { TYPE_COLORS } from '../constants/typeColors';

interface Props {
  type: string;
  selected: boolean;
  onToggle: (type: string) => void;
}

function Pill({ type, selected, onToggle }: Props) {
  const color = TYPE_COLORS[type] ?? '#999';

  return (
    <Pressable
      onPress={() => onToggle(type)}
      className="mb-3 mr-3 rounded-full px-4 py-2"
      style={{
        backgroundColor: color,
        borderWidth: selected ? 2 : 0,
        borderColor: selected ? 'black' : 'transparent',
      }}
      accessibilityRole="button"
      accessibilityLabel={`Filter by ${type}`}>
      <Text className=" font-semibold capitalize ">{type}</Text>
    </Pressable>
  );
}

export default memo(Pill);
