import { useState, useEffect } from "react";

const fetchCategoriesData = async () => {
  try {
    console.log("request");
    let host = "https://orca-app-ilspx.ondigitalocean.app";
    const response = await fetch(`${host}/api/getCategorizedTopics`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    // TODO HANDLE ERROR PROPERLY
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
};

const useCategories = () => {
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [topics, setTopics] = useState([]);

  const loadData = async () => {
    const data = await fetchCategoriesData();
    let firstCategory = Object.keys(data)[0];
    console.log("data", firstCategory);
    setCategories(data);
    setSelectedCategory(firstCategory);
    setTopics(data[firstCategory].topics);
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setTopics(categories[category].topics);
  };

  const refreshCategories = async () => {
    try {
      const data = await fetchCategoriesData();
      setCategories(data);
      if (!(selectedCategory in data)) {
        const newSelectedCategory = Object.keys(data)[0];
        setSelectedCategory(newSelectedCategory);
        setTopics(data[newSelectedCategory].topics);
      }
    } catch (error) {
      console.error("Error refreshing categories:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    categories,
    selectedCategory,
    topics,
    handleSelectCategory,
    refreshCategories,
  };
};

export default useCategories;
