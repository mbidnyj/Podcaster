import React from "react";
import {
  View,
  Button,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "expo-router";
import { usePathname } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import PromptScreen from "./PromptScreen/PromptScreen";

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#FFFFFF", // Assuming white background from the image context
    alignItems: "center", // Center logo horizontally
    justifyContent: "center", // Center logo vertically
    paddingTop: 10,
    paddingBottom: 20,
  },
  logo: {
    width: 120, // Width from the Figma specs
    height: 24, // Height from the Figma specs
    resizeMode: "contain", // Ensure the logo scales properly without being cropped
  },
});

const Header = ({ onLogoPress }) => {
  const navigation = useNavigation();
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  return (
    <View
      style={[
        styles.header,
        { flexDirection: "row", justifyContent: "space-between" },
      ]}
    >
      {!isHomepage ? (
        <View style={{ width: 48 }}>
          <AntDesign
            name="left"
            size={24}
            color="black"
            onPress={() => navigation.goBack()}
          />
        </View>
      ) : (
        <View style={{ width: 48 }} />
      )}
      <View style={{ flex: 1, alignItems: "center" }}>
        <TouchableOpacity onPress={onLogoPress}>
          <Image source={require("../assets/logo.png")} style={styles.logo} />
        </TouchableOpacity>
      </View>
      <View style={{ width: 48 }} />
    </View>
  );
};

export default Header;
