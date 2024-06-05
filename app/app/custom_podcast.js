import React from "react";
import { useLocalSearchParams } from "expo-router";
import NewPodcastPageLayout from "../components/podcast_screen/NewPodcastPageLayout";

export default function Page() {
  const { text } = useLocalSearchParams();

  return <NewPodcastPageLayout prompt={text} />;
}
