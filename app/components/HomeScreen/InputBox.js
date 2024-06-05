import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";

const inputBoxStyle = {
  flexDirection: "row",
  alignItems: "center",
  padding: 16,
  backgroundColor: "#F6F6F6",
};

const getTextInputStyle = (isActive) => ({
  flex: 1,
  borderWidth: 1,
  backgroundColor: "#FFFFFF",
  borderColor: isActive ? "#C5CAD2" : "#E1E3E6",
  borderRadius: 20,
  padding: 10,
  paddingTop: 10,
  paddingBottom: 10,
  fontSize: 16,
  minHeight: 40,
  maxHeight: 100,
});

const sendButtonStyle = {
  alignSelf: "flex-end",
  marginLeft: 10,
  backgroundColor: "#28EDBD",
  borderRadius: 20,
  width: 40,
  height: 40,
  justifyContent: "center",
  alignItems: "center",
};

const InputBox = ({ onSubmit }) => {
  const [text, setText] = useState("");
  const [isFocused, setIsFocused] = useState(false); // State to track focus

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text);
    }
  };

  return (
    <View style={inputBoxStyle}>
      <TextInput
        style={getTextInputStyle(isFocused)}
        multiline
        placeholder="Write your topic..."
        onChangeText={setText}
        value={text}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onSubmitEditing={handleSubmit}
      />
      <TouchableOpacity
        style={{ ...sendButtonStyle, opacity: text.length > 0 ? 1 : 0 }}
        onPress={handleSubmit}
      >
        <Text style={{ color: "#333232", fontSize: 20 }}>↑</Text>
      </TouchableOpacity>
    </View>
  );
};

export default InputBox;
