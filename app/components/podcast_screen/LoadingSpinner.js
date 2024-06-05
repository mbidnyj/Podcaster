import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { Entypo } from "@expo/vector-icons";

export default function LoadingSpinner() {
  const rotateAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnimation]);

  const rotation = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={{ transform: [{ rotate: rotation }] }}>
      <Entypo name="circular-graph" size={48} color="white" />
    </Animated.View>
  );
}
