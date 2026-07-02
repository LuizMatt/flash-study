import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useApp } from "../context/AppContext";
import FlashCard from "./FlashCard";

interface ReviewFlowProps {
  categoryId?: string;
}

export default function ReviewFlow({ categoryId }: ReviewFlowProps) {
  const { state, markLearned, updateSession, resetLearned } = useApp();
  const router = useRouter();

  // Captura os cards uma vez ao montar a sessão para evitar que o índice
  // fique errado quando MARK_LEARNED remove o card do filtro ao vivo.
  const [cards, setCards] = useState(() =>
    state.flashcards.filter((f) => {
      if (f.learned) return false;
      if (categoryId) return f.categoryId === categoryId;
      return true;
    }),
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [learnedCount, setLearnedCount] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const total = cards.length;
  const current = cards[currentIndex];

  async function handleReset() {
    await resetLearned(categoryId ?? null);
    const resetCards = state.flashcards
      .map((f) => {
        if (!categoryId || f.categoryId === categoryId) {
          return { ...f, learned: false };
        }
        return f;
      })
      .filter((f) => {
        if (categoryId) return f.categoryId === categoryId;
        return true;
      });
    setCards(resetCards);
    setCurrentIndex(0);
    setLearnedCount(0);
    setShowResult(false);
  }

  async function advance(learned: boolean) {
    const nextLearnedCount = learnedCount + (learned ? 1 : 0);

    if (learned) {
      await markLearned(current.id);
    }

    if (currentIndex + 1 >= total) {
      await updateSession({
        categoryId: categoryId,
        total,
        correct: nextLearnedCount,
      });
      setLearnedCount(nextLearnedCount);
      setShowResult(true);
    } else {
      setLearnedCount(nextLearnedCount);
      setCurrentIndex((prev) => prev + 1);
    }
  }

  if (total === 0) {
    const hasAnyCards = state.flashcards.some((f) =>
      categoryId ? f.categoryId === categoryId : true,
    );

    return (
      <View style={styles.container}>
        <Text style={styles.resultTitle}>Tudo em dia!</Text>
        <Text style={styles.resultText}>Não há cards para revisar.</Text>
        {hasAnyCards && (
          <TouchableOpacity style={styles.doneButton} onPress={handleReset}>
            <Text style={styles.doneButtonText}>Revisar Novamente</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (showResult) {
    return (
      <View style={styles.container}>
        <Text style={styles.resultTitle}>Sessão concluída!</Text>
        <Text style={styles.resultScore}>
          {learnedCount}/{total}
        </Text>
        <Text style={styles.resultText}>cards marcados como aprendidos</Text>
        <View style={{ gap: 12 }}>
          <TouchableOpacity style={styles.doneButton} onPress={handleReset}>
            <Text style={styles.doneButtonText}>Revisar Novamente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.doneButton,
              {
                backgroundColor: "#1e293b",
                borderWidth: 1,
                borderColor: "#334155",
              },
            ]}
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/(tabs)/categories")
            }
          >
            <Text style={[styles.doneButtonText, { color: "#94a3b8" }]}>
              Voltar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.counter}>
          {currentIndex + 1} / {total}
        </Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / total) * 100}%` },
            ]}
          />
        </View>
      </View>

      <View style={styles.cardArea}>
        <FlashCard
          key={currentIndex}
          front={current.front}
          back={current.back}
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => advance(false)}
        >
          <Text style={styles.skipButtonText}>Rever depois</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.learnedButton}
          onPress={() => advance(true)}
        >
          <Text style={styles.learnedButtonText}>Aprendi!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 20,
    justifyContent: "center",
  },
  header: {
    marginBottom: 32,
  },
  counter: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#1e293b",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6C4EF5",
    borderRadius: 3,
  },
  cardArea: {
    marginBottom: 32,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#1e293b",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  skipButtonText: {
    color: "#94a3b8",
    fontWeight: "600",
    fontSize: 15,
  },
  learnedButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#2DCE7D",
    alignItems: "center",
  },
  learnedButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  resultTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  resultScore: {
    color: "#6C4EF5",
    fontSize: 64,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  resultText: {
    color: "#94a3b8",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
  },
  doneButton: {
    backgroundColor: "#6C4EF5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  doneButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
