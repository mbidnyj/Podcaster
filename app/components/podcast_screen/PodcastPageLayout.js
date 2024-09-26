import React from "react";
import { useNavigation } from "expo-router";
import { Entypo } from "@expo/vector-icons";
import { Text, View, Image, Pressable, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Player from "./Player";

const PodcastPageLayout = ({ emoji, title, uri }) => {
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.6)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.8 }}
      style={{
        flex: 1,
        color: "#FFF",
        backgroundColor: "#5A5959",
      }}
    >
      <SafeAreaView style={{ flex: 1, justifyContent: "space-between" }}>
        <View style={{ justifyContent: "flex-start" }}>
          <Pressable
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                // Handle the case where there is no screen to go back to
                console.warn("No screen to go back to");
              }
            }}
            style={{
              width: 48,
              height: 48,
              marginLeft: 8,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Entypo name="chevron-thin-down" size={24} color="white" />
          </Pressable>
          <Image
            source={require("../../assets/podcast_cover.png")}
            style={{
              width: "100%",
              resizeMode: "contain",
              height: undefined,
              aspectRatio: 1,
            }}
          />
        </View>
        <View style={{ paddingHorizontal: 24 }}>
          <Text
            style={{
              fontSize: 24,
              color: "#fff",
              marginBottom: 14,
            }}
          >
            {emoji}
          </Text>
          <Text
            style={{
              color: "#FFF",
              fontWeight: "bold",
              fontSize: 20,
            }}
          >
            {title}
          </Text>
          <Player uri={uri} />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default PodcastPageLayout;
