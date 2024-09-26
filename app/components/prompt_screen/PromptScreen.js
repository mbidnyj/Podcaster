import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";

// const baseUrl = "http://localhost:8080";
const baseUrl = "https://orca-app-ilspx.ondigitalocean.app";

const PromptScreen = () => {
  const [prompt, setPrompt] = useState("");
  const [notification, setNotification] = useState({ message: "", color: "" });

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const response = await fetch(`${baseUrl}/modifyPrompt`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          setNotification({ message: "Failed to fetch prompt", color: "red" });
          throw new Error("Failed to fetch prompt");
        }

        const data = await response.json();
        setPrompt(data);
      } catch (error) {
        setNotification({
          message: "Error fetching prompt: " + error.message,
          color: "red",
        });
      }
    };

    fetchPrompt();
  }, []);

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${baseUrl}/modifyPrompt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ promptInstruction: prompt }),
      });

      if (!response.ok) {
        setNotification({
          message: "Network response was not ok",
          color: "red",
        });
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setNotification({
        message: "Submitted prompt successfully",
        color: "green",
      });
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error) {
      setNotification({
        message: "Error submitting prompt: " + error.message,
        color: "red",
      });
    }
  };

  return (
    <View style={styles.container}>
      {notification.message ? (
        <View
          style={[styles.notification, { backgroundColor: notification.color }]}
        >
          <Text style={styles.notificationText}>{notification.message}</Text>
        </View>
      ) : null}
      <TextInput
        style={styles.input}
        value={prompt}
        onChangeText={setPrompt}
        placeholder="Enter your prompt here..."
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  input: {
    flex: 1, // Make the input take up the remaining space
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  notification: {
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  notificationText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
});

export default PromptScreen;
