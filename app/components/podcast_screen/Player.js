import React, { useRef, useState, useEffect } from "react";
import { View, Text } from "react-native";
import { Audio } from "expo-av";
import { Entypo } from "@expo/vector-icons";
import LoadingSpinner from "./LoadingSpinner";

const mapStatusToText = (status) => {
  switch (status) {
    case "online_research":
      return "Online research...";
    case "analyzing":
      return "Writing notes...";
    case "generating_text":
      return "Recording... 🎙️";
    case "text_to_speech":
      return "Publishing...";
    case "ready":
      return "Podcast is ready!";
    default:
      return "Preparing podcast...";
  }
};

export default function Player({ uri, status = "" }) {
  const playbackObjectRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!uri) return;

    const loadSound = async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const response = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        _onPlaybackStatusUpdate
      );
      if (playbackObjectRef.current) {
        await playbackObjectRef.current.stopAsync();
        await playbackObjectRef.current.unloadAsync();
      }
      playbackObjectRef.current = response.sound;
      await playbackObjectRef.current.playAsync();
      playbackObjectRef.current.setPositionAsync(0);
    };

    const _onPlaybackStatusUpdate = (playbackStatus) => {
      if (!playbackStatus.isLoaded) {
        setIsLoading(true);
        if (playbackStatus.error) {
          console.log(
            `Encountered a fatal error during playback: ${playbackStatus.error}`
          );
        }
      } else {
        setIsLoading(false);
        if (playbackStatus.isPlaying) {
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
        }
      }
    };

    loadSound();
    return () => {
      (async () => {
        if (playbackObjectRef.current) {
          try {
            await playbackObjectRef.current.stopAsync();
            await playbackObjectRef.current.unloadAsync();
          } catch (error) {
            console.error("Error stopping or unloading audio:", error);
          }
        }
      })();
    };
  }, [uri]);

  const togglePlayback = async () => {
    if (isPlaying) {
      await playbackObjectRef.current.pauseAsync();
    } else {
      await playbackObjectRef.current.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <View
      style={{ height: 200, justifyContent: "center", alignItems: "center" }}
    >
      {isLoading || !uri ? (
        <>
          <LoadingSpinner />
          <Text style={{ color: "white", marginTop: 15 }}>
            {mapStatusToText(status)}
          </Text>
        </>
      ) : (
        <>
          <Entypo
            name={isPlaying ? "controller-paus" : "controller-play"}
            size={48}
            color="white"
            onPress={togglePlayback}
          />
          <Text style={{ color: "white", marginTop: 10 }}> </Text>
        </>
      )}
    </View>
  );
}
