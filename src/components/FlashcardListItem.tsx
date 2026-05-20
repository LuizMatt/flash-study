import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Flashcard } from '../types/Flashcard';

interface Props {
  flashcard: Flashcard;
  onToggleLearned?: (flashcard: Flashcard) => void;
}

export default function FlashcardListItem({ flashcard, onToggleLearned }: Props) {
  const statusColor = flashcard.learned ? '#34C759' : '#FF9500';
  const statusLabel = flashcard.learned ? 'Aprendido' : 'Pendente';

  return (
    <View style={styles.cardItem}>
      <View style={styles.textContainer}>
        <Text style={styles.cardFront} numberOfLines={2}>
          {flashcard.front}
        </Text>
        <Text style={styles.cardBack} numberOfLines={2}>
          {flashcard.back}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.badge, { backgroundColor: statusColor + '20' }]}
        onPress={() => onToggleLearned?.(flashcard)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Marcar card como ${flashcard.learned ? 'pendente' : 'aprendido'}`}
      >
        <Text style={[styles.badgeText, { color: statusColor }]}>
          {statusLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  cardFront: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '600',
    marginBottom: 4,
  },
  cardBack: {
    fontSize: 14,
    color: '#6B7280',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
