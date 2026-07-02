import React from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Flashcard } from '../types/Flashcard';

interface Props {
  flashcard: Flashcard;
  onToggleLearned?: (flashcard: Flashcard) => void;
  onDelete?: (flashcard: Flashcard) => void;
}

export default function FlashcardListItem({ flashcard, onToggleLearned, onDelete }: Props) {
  const statusColor = flashcard.learned ? '#34C759' : '#FF9500';
  const statusLabel = flashcard.learned ? 'Aprendido' : 'Pendente';

  function handleDelete() {
    if (Platform.OS === 'web') {
      if (confirm('Deseja excluir este flashcard?')) {
        onDelete?.(flashcard);
      }
    } else {
      Alert.alert(
        'Excluir flashcard',
        'Tem certeza que deseja excluir este card? Esta ação não pode ser desfeita.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: () => onDelete?.(flashcard) },
        ],
      );
    }
  }

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

      <View style={styles.actions}>
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

        {onDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Excluir flashcard"
          >
            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF1F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
