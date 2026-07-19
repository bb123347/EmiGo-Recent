import 'react-native-url-polyfill/auto';
import * as SplashScreen from 'expo-splash-screen';
import 'expo-router/entry';

// Failsafe: some standalone builds never trigger expo-router's own
// SplashScreen.hideAsync(), leaving the native splash pinned on top of the
// rendered app forever. Force-hide it shortly after startup so the app is
// always revealed.
setTimeout(() => {
  SplashScreen.hideAsync().catch(() => {});
}, 2500);
