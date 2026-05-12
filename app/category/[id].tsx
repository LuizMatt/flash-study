import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import ProgressBar from '../../src/components/ProgressBar';
import { Ionicons } from '@expo/vector-icons';

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { categories, flashcards } = useApp();

  const category = categories.find((c) => c.id === id);
  const categoryFlashcards = flashcards.filter((f) => f.categoryId === id);

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

  const renderFlashcardItem = ({ item }: { item: typeof categoryFlashcards[0] }) => (
    <View style={styles.cardItem}>
      <Text style={styles.cardFront} numberOfLines={2}>
        {item.front}
      </Text>
      <View style={[styles.badge, { backgroundColor: item.learned ? '#34C75920' : '#FF950020' }]}>
        <Text style={[styles.badgeText, { color: item.learned ? '#34C759' : '#FF9500' }]}>
          {item.learned ? 'Aprendido' : 'Pendente'}
        </Text>
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
            <Ionicons name={category.icon as any} size={32} color={category.color} />
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
        data={categoryFlashcards}
        keyExtractor={(item) => item.id}
        renderItem={renderFlashcardItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<Text style={styles.listTitle}>Flashcards</Text>}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum card nesta categoria.</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.reviewButton, { backgroundColor: category.color }]}
          onPress={() => router.push({ pathname: '/review', params: { categoryId: category.id } })}
        >
          <Ionicons name="play" size={20} color="#FFF" style={styles.buttonIcon} />
          <Text style={styles.reviewButtonText}>Iniciar revisão</Text>
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
    paddingBottom: 100,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  cardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  cardFront: {
    fontSize: 16,
    color: '#1C1C1E',
    flex: 1,
    marginRight: 12,
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
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
    backgroundColor: '#F8F9FA',
  },
  reviewButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
});
