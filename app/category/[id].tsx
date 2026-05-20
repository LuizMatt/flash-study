import React, { useMemo, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../src/context/AppContext';
import FlashcardListItem from '../../src/components/FlashcardListItem';
import ProgressBar from '../../src/components/ProgressBar';
import { Flashcard } from '../../src/types/Flashcard';
import { getCategoryIcon } from '../../src/constants/categoryIcons';

type Filter = 'all' | 'pending' | 'learned';

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Pendentes', value: 'pending' },
  { label: 'Aprendidos', value: 'learned' },
];

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useApp();
  const { categories, flashcards } = state;
  const [selectedFilter, setSelectedFilter] = useState<Filter>('all');

  const category = categories.find((c) => c.id === id);
  const categoryFlashcards = useMemo(
    () => flashcards.filter((f) => f.categoryId === id),
    [flashcards, id]
  );
  const filteredFlashcards = useMemo(() => {
    return categoryFlashcards
      .filter((flashcard) => {
        if (selectedFilter === 'learned') {
          return flashcard.learned;
        }

        if (selectedFilter === 'pending') {
          return !flashcard.learned;
        }

        return true;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [categoryFlashcards, selectedFilter]);

  if (!category) {
    return (
      <View style={styles.errorContainer}>
        <Text>Categoria não encontrada</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const total = categoryFlashcards.length;
  const learned = categoryFlashcards.filter((f) => f.learned).length;
  const progress = total > 0 ? learned / total : 0;
  const pct = Math.round(progress * 100);

  const goToCreateCard = () => {
    router.push({ pathname: '/create', params: { categoryId: category.id } });
  };

  const toggleCardLearned = (flashcard: Flashcard) => {
    dispatch({
      type: 'SET_CARD_LEARNED',
      payload: {
        id: flashcard.id,
        learned: !flashcard.learned,
      },
    });
  };

  const renderFlashcardItem = ({ item }: { item: Flashcard }) => (
    <FlashcardListItem flashcard={item} onToggleLearned={toggleCardLearned} />
  );

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.listTitleRow}>
        <Text style={styles.listTitle}>Flashcards</Text>
        <TouchableOpacity
          style={[styles.addCardButton, { borderColor: category.color }]}
          onPress={goToCreateCard}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={18} color={category.color} />
          <Text style={[styles.addCardText, { color: category.color }]}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((filter) => {
          const isSelected = selectedFilter === filter.value;

          return (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterButton,
                isSelected && {
                  backgroundColor: category.color,
                  borderColor: category.color,
                },
              ]}
              onPress={() => setSelectedFilter(filter.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, isSelected && styles.selectedFilterText]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: category.name,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#F8F9FA' },
        }}
      />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
            <Ionicons name={getCategoryIcon(category.icon)} size={32} color={category.color} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.statsText}>
              {learned} de {total} cards aprendidos
            </Text>
          </View>
          <View style={styles.pctContainer}>
            <Text style={[styles.pctText, { color: category.color }]}>{pct}%</Text>
          </View>
        </View>

        <View style={styles.progressWrapper}>
          <ProgressBar progress={progress} color={category.color} />
        </View>
      </View>

      <FlatList
        data={filteredFlashcards}
        keyExtractor={(item) => item.id}
        renderItem={renderFlashcardItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {total === 0 ? 'Nenhum card nesta categoria.' : 'Nenhum card neste filtro.'}
            </Text>
            {total === 0 && (
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: category.color }]}
                onPress={goToCreateCard}
                activeOpacity={0.7}
              >
                <Text style={styles.emptyButtonText}>Adicionar primeiro card</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity
          style={[
            styles.reviewButton,
            { backgroundColor: total > 0 ? category.color : '#C7C7CC' },
          ]}
          disabled={total === 0}
          onPress={() => router.push({ pathname: '/review', params: { categoryId: category.id } })}
        >
          <Ionicons name="play" size={20} color="#FFF" style={styles.buttonIcon} />
          <Text style={styles.reviewButtonText}>
            {total > 0 ? 'Iniciar revisão' : 'Adicione cards para revisar'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backLink: {
    marginTop: 10,
    color: '#007AFF',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  statsText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  pctContainer: {
    alignItems: 'flex-end',
  },
  pctText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressWrapper: {
    marginTop: 8,
  },
  listContent: {
    padding: 20,
    paddingBottom: 120,
  },
  listHeader: {
    marginBottom: 16,
  },
  listTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 36,
  },
  addCardText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    height: 34,
    borderRadius: 17,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedFilterText: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyButton: {
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  reviewButton: {
    flexDirection: 'row',
    minHeight: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  reviewButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
