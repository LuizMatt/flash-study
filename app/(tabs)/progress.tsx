import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useApp } from '../../src/context/AppContext';
import ProgressBar from '../../src/components/ProgressBar';
import { Ionicons } from '@expo/vector-icons';
import { getCategoryIcon } from '../../src/constants/categoryIcons';

export default function ProgressScreen() {
  const { state } = useApp();
  const { categories, flashcards } = state;

  const categoryStats = categories.map((cat) => {
    const catFlashcards = flashcards.filter((c) => c.categoryId === cat.id);
    const total = catFlashcards.length;
    const learned = catFlashcards.filter((c) => c.learned).length;
    const pct = total > 0 ? Math.round((learned / total) * 100) : 0;
    const progress = total > 0 ? learned / total : 0;

    return {
      ...cat,
      total,
      learned,
      pct,
      progress,
    };
  });

  const totalCards = flashcards.length;
  const totalLearned = flashcards.filter((c) => c.learned).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Seu Progresso</Text>

        <View style={styles.categoriesContainer}>
          {categoryStats.map((cat) => (
            <View key={cat.id} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <View style={[styles.iconContainer, { backgroundColor: cat.color + '20' }]}>
                  <Ionicons name={getCategoryIcon(cat.icon)} size={20} color={cat.color} />
                </View>
                <View style={styles.nameContainer}>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                  <Text style={styles.categoryCount}>
                    {cat.learned}/{cat.total} cards aprendidos
                  </Text>
                </View>
                <Text style={styles.percentageText}>{cat.pct}%</Text>
              </View>
              <ProgressBar progress={cat.progress} color={cat.color} />
            </View>
          ))}
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total de Cards</Text>
            <Text style={styles.summaryValue}>{totalCards}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Aprendidos</Text>
            <Text style={styles.summaryValue}>{totalLearned}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 24,
    marginTop: 10,
  },
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  categoryItem: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  categoryCount: {
    fontSize: 12,
    color: '#8E8E93',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
});
