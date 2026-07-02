import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface FlashCardProps {
  front: string;
  back: string;
}

export default function FlashCard({ front, back }: FlashCardProps) {
  const flip = useSharedValue(0);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` }],
    backfaceVisibility: "hidden",
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` }],
    backfaceVisibility: "hidden",
  }));

  const handleFlip = () => {
    flip.value = withTiming(flip.value === 0 ? 1 : 0, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });
  };

  return (
    <TouchableOpacity onPress={handleFlip} activeOpacity={1} style={styles.container}>
      <Animated.View style={[styles.card, styles.front, frontStyle]}>
        <Text style={styles.hint}>Toque para revelar</Text>
        <Text style={styles.cardText}>{front}</Text>
      </Animated.View>
      <Animated.View style={[styles.card, styles.back, backStyle]}>
        <View style={styles.backLabel}>
          <Text style={styles.backLabelText}>RESPOSTA</Text>
        </View>
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
  hint: {
    position: "absolute",
    top: 14,
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  backLabel: {
    position: "absolute",
    top: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  backLabelText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  cardText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
});
