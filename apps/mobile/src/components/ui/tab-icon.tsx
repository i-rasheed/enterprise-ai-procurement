import { Text, type ColorValue } from "react-native";

export function TabIcon({ label, color }: { label: string; color: ColorValue }) {
  return <Text style={{ color, fontSize: 18 }}>{label}</Text>;
}
