/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    primary: '#1C375B', // Dark Blue
    secondary: '#E8ECF1', // Light Blue-Grey (derived light version)
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    accent: '#F5A623', // Example accent (like for an edit icon) - optional
    border: '#D0D7E0', // Slightly darker than secondary for borders
    error: '#D9534F', // Standard error red
  },
  dark: {
    primary: '#1C375B', // Dark Blue
    secondary: '#E8ECF1', // Light Blue-Grey (derived light version)
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    accent: '#F5A623', // Example accent (like for an edit icon) - optional
    border: '#D0D7E0', // Slightly darker than secondary for borders
    error: '#D9534F', // Standard error red
  },
};
