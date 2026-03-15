// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  // Navigation
  "house.fill": "home",
  "list.bullet": "list",
  "lightbulb.fill": "lightbulb",
  "gearshape.fill": "settings",
  "paperplane.fill": "send",
  // Actions
  "plus": "add",
  "plus.circle.fill": "add-circle",
  "minus.circle.fill": "remove-circle",
  "pencil": "edit",
  "trash.fill": "delete",
  "checkmark.circle.fill": "check-circle",
  "xmark.circle.fill": "cancel",
  "xmark": "close",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "chevron.down": "expand-more",
  "chevron.up": "expand-less",
  "chevron.left.forwardslash.chevron.right": "code",
  // Food / Preservation
  "snowflake": "ac-unit",
  "flame.fill": "local-fire-department",
  "leaf.fill": "eco",
  "clock.fill": "schedule",
  "calendar": "calendar-today",
  "bell.fill": "notifications",
  "bell.slash.fill": "notifications-off",
  "magnifyingglass": "search",
  "arrow.up.arrow.down": "swap-vert",
  "square.grid.2x2.fill": "grid-view",
  "info.circle.fill": "info",
  "exclamationmark.triangle.fill": "warning",
  "checkmark.seal.fill": "verified",
  "tag.fill": "label",
  "cube.box.fill": "inventory-2",
  "fork.knife": "restaurant",
  "drop.fill": "water-drop",
  "wind": "air",
  "sun.max.fill": "wb-sunny",
  "lock.fill": "lock",
  "chart.bar.fill": "bar-chart",
  "heart.fill": "favorite",
  "star.fill": "star",
  "photo": "photo",
  "camera.fill": "camera-alt",
  "arrow.clockwise": "refresh",
  "square.and.arrow.up": "share",
  "moon.fill": "dark-mode",
  "sun.min.fill": "light-mode",
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
