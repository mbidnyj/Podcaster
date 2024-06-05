import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";

const topicListStyle = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  topicItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  topicEmoji: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 3,
    alignSelf: "baseline",
  },
  topicText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "bold",
    flex: 1,
  },
});

const TopicList = ({ topics }) => (
  <View style={topicListStyle.container}>
    <Text style={topicListStyle.title}>So, have you heard about…</Text>
    {topics.map((topic, index) => (
      <Link
        key={topic.title}
        href={{
          pathname: "/static_podcast/[id]",
          params: {
            id: topic._id,
            title: topic.title,
            emoji: topic.emoji,
            podcastCdnUrl: topic.podcastCdnUrl,
          },
        }}
        asChild
      >
        <Pressable>
          <View style={topicListStyle.topicItem}>
            <Text style={topicListStyle.topicEmoji}>{topic.emoji}</Text>
            <Text style={topicListStyle.topicText}>{topic.title}</Text>
          </View>
        </Pressable>
      </Link>
    ))}
  </View>
);

export default TopicList;
