import { Dimensions, Platform, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const isSmallDevice = SCREEN_WIDTH < 375;
export const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
export const isLargeDevice = SCREEN_WIDTH >= 414;

// Detect if device has home indicator (iPhone X+ or Android with gesture nav)
export const hasHomeIndicator = Platform.OS === "ios" && SCREEN_HEIGHT >= 812;

// Scale based on screen width (base: 390px - iPhone 14)
export const scale = (size: number): number => (SCREEN_WIDTH / 390) * size;

// Moderate scale - less aggressive scaling for text
export const moderateScale = (size: number, factor: number = 0.5): number =>
  size + (scale(size) - size) * factor;

// Vertical scale based on screen height (base: 844px - iPhone 14)
export const verticalScale = (size: number): number => (SCREEN_HEIGHT / 844) * size;

// Responsive values based on device size
export const responsive = <T,>(small: T, medium: T, large: T): T => {
  if (isSmallDevice) return small;
  if (isLargeDevice) return large;
  return medium;
};

export { SCREEN_WIDTH, SCREEN_HEIGHT, Platform };
