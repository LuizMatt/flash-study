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
      onPress={() => router.push(`/review/${category.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: category.color + '15' }]}>
          <Ionicons name={getCategoryIcon(category.icon)} size={22} color={category.color} />
        </View>
        <Text style={styles.topCount}>{totalCount} cards</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{category.name}</Text>
        <Text style={styles.count}>
          {learnedCount} de {totalCount} concluídos
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
    borderRadius: 16,
    padding: 18,
    margin: 6,
    flex: 1,
    minHeight: 154,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topCount: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  count: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
  },
  progressWrapper: {
    marginTop: 10,
  },
});
