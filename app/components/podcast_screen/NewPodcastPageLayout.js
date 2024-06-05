import React from "react";
import { useNavigation } from "expo-router";
import { Entypo } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import axios from "axios";
import { Text, View, Image, Pressable, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import useWebSocket from "react-native-use-websocket";
import Player from "./Player";

const NewPodcastPageLayout = ({ prompt }) => {
  const navigation = useNavigation();
  const [emoji, setEmoji] = useState("👽");
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [status, setStatus] = useState("analyzing");
  const [podcastUrl, setPodcastUrl] = useState(null);
  let host = "wss://orca-app-ilspx.ondigitalocean.app";
  //host = "wss://2358-2a01-4b00-b249-ea00-e593-3f55-abb7-b7f1.ngrok-free.app";
  const { sendMessage, lastMessage } = useWebSocket(`${host}/api/websocket`);

  useEffect(() => {
    sendMessage(`prompt: ${prompt}`);
  }, [prompt]);

  useEffect(() => {
    if (!lastMessage.data) return;
    const line = lastMessage.data.toString();
    console.log("ws message", line);
    const { command, payload } = JSON.parse(line);
    if (command === "status_update") {
      setStatus(payload.status);
    } else if (command === "podcast_ready") {
      setPodcastUrl(payload.url);
    } else if (command === "update_info") {
      setEmoji(payload.emoji);
      setTitle(payload.title);
      setTag(payload.tag);
    }
  }, [lastMessage]);

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
            onPress={() => navigation.goBack()}
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
            {prompt}
          </Text>
          <Player uri={podcastUrl} status={status} />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default NewPodcastPageLayout;
