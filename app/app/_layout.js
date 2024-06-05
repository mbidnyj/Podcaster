import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router/stack";

const podcastOptions = {
  headerBackTitleVisible: false,
  gestureDirection: "vertical",
  animationDuration: 200,
  fullScreenGestureEnabled: true,
  headerBackTitleVisible: false,
  headerShown: false,
};

function AppContent() {
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: "#fff",
        },
      }}
    >
      <Stack.Screen name="static_podcast/[id]" options={podcastOptions} />
      <Stack.Screen name="custom_podcast" options={podcastOptions} />
    </Stack>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
