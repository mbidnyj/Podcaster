import React from "react";
import { useLocalSearchParams } from "expo-router";
import PodcastPageLayout from "../../components/podcast_screen/PodcastPageLayout";

export default function Page() {
  const { id, title, emoji, podcastCdnUrl } = useLocalSearchParams();

  return <PodcastPageLayout emoji={emoji} title={title} uri={podcastCdnUrl} />;
}
