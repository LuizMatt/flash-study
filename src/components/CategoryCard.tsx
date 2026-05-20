import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Category } from '../types/Category';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from './ProgressBar';
import { getCategoryIcon } from '../constants/categoryIcons';

interface Props {
  category: Category;
  learnedCount: number;
  totalCount: number;
}

export default function CategoryCard({ category, learnedCount, totalCount }: Props) {
  const progress = totalCount > 0 ? learnedCount / totalCount : 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/category/${category.id}`)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
        <Ionicons name={getCategoryIcon(category.icon)} size={24} color={category.color} />
      </View>
      <Ionicons name="chevron-forward" size={18} color="#C7C7CC" style={styles.chevron} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{category.name}</Text>
        <Text style={styles.count}>
          {learnedCount} de {totalCount} cards
        </Text>
        <View style={styles.progressWrapper}>
          <ProgressBar progress={progress} color={category.color} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    margin: 6,
    flex: 1,
    minHeight: 154,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoContainer: {
    flex: 1,
  },
  chevron: {
    position: 'absolute',
    top: 16,
    right: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  count: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  progressWrapper: {
    marginTop: 12,
  },
});
