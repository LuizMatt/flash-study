import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface FlashCardProps {
  front: string;
  back: string;
}

export default function FlashCard({ front, back }: FlashCardProps) {
  const rotation = useSharedValue(0);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotation.value}deg` }],
    backfaceVisibility: "hidden",
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotation.value + 180}deg` }],
    backfaceVisibility: "hidden",
  }));

  const flip = () => {
    rotation.value = withTiming(rotation.value === 0 ? 180 : 0, {
      duration: 500,
    });
  };

  return (
    <TouchableOpacity onPress={flip} activeOpacity={1} style={styles.container}>
      <Animated.View style={[styles.card, styles.front, frontStyle]}>
        <Text style={styles.cardText}>{front}</Text>
      </Animated.View>
      <Animated.View style={[styles.card, styles.back, backStyle]}>
        <Text style={styles.cardText}>{back}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 1.6,
  },
  card: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  front: {
    backgroundColor: "#6C4EF5",
  },
  back: {
    backgroundColor: "#2DCE7D",
  },
  cardText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
});
