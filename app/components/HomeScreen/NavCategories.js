import React from "react";
import {
  useColorScheme,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {} from "react-native";

const getDynamicStyles = (colorScheme) =>
  StyleSheet.create({
    navCategoriesContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 20,
      flexGrow: 0,
    },
    categoryText: {
      color: colorScheme === "light" ? "#000000" : "#FFFFFF",
      fontSize: 13,
      lineHeight: 24,
      fontWeight: "600",
      paddingVertical: 4,
      paddingHorizontal: 12,
      marginRight: 8,
      borderRadius: 16,
      backgroundColor: colorScheme === "light" ? "#F0F0F0" : "#333333",
      overflow: "hidden",
    },
    activeCategoryText: {
      color: colorScheme === "light" ? "#FFFFFF" : "#000000",
      backgroundColor: colorScheme === "light" ? "#000000" : "#FFFFFF",
    },
  });

const NavCategories = ({ categories, onSelectCategory, selectedCategory }) => {
  const colorScheme = useColorScheme();
  const styles = getDynamicStyles(colorScheme);

  return (
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.navCategoriesContainer}
    >
      {Object.keys(categories).map((category, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onSelectCategory(category)}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category && styles.activeCategoryText,
            ]}
          >
            {categories[category].title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default NavCategories;
