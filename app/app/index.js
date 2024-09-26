import React, {
  useLayoutEffect,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  useColorScheme,
  KeyboardAvoidingView,
  View,
  ScrollView,
  Platform,
  RefreshControl,
} from "react-native";
import Header from "../components/Header";
import useCategories from "../hooks/useCategories";
import NavCategories from "../components/HomeScreen/NavCategories";
import TopicList from "../components/HomeScreen/TopicList";
import InputBox from "../components/HomeScreen/InputBox";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function HomePage() {
  const {
    categories,
    selectedCategory,
    topics,
    handleSelectCategory,
    refreshCategories,
  } = useCategories();
  const [isDataRendered, setIsDataRendered] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (Object.keys(categories).length > 0) {
      console.log("Categories have been loaded.");
      setIsDataRendered(true);
    }
  }, [categories]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshCategories().then(() => setRefreshing(false));
  }, [refreshCategories]);

  useLayoutEffect(() => {
    if (isDataRendered) {
      SplashScreen.hideAsync();
    }
  }, [isDataRendered]);
  const insets = useSafeAreaInsets(); // Get the current safe area insets
  const scheme = useColorScheme();
  const containerStyle = {
    flex: 1,
    backgroundColor: scheme === "dark" ? "#F6F6F6" : "#F6F6F6",
    paddingBottom: insets.bottom, // Apply bottom inset as padding
  };
  // this extra view is needed to have grey input background outside
  // of safe area
  const innerContainerStyle = {
    flex: 1,
    backgroundColor: scheme === "dark" ? "#121212" : "#fff",
    paddingTop: insets.top,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };
  const onSubmit = (text) => {
    console.log("custom text", text);
    router.push({
      pathname: "/custom_podcast",
      params: {
        text,
      },
    });
  };

  const handleLogoPress = () => {
    router.push("/prompt_screen");
  };

  return (
    <View style={containerStyle}>
      <View style={innerContainerStyle}>
        <Header onLogoPress={handleLogoPress} />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={{ flex: 1 }}>
            <Stack.Screen
              options={{
                headerShown: false,
              }}
            />
            <View style={{ flexGrow: 0 }}>
              <NavCategories
                categories={categories}
                onSelectCategory={handleSelectCategory}
                selectedCategory={selectedCategory}
              />
            </View>
            <ScrollView
              style={{ flexGrow: 1 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              <TopicList topics={topics} />
            </ScrollView>
            <InputBox onSubmit={onSubmit} />
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}
