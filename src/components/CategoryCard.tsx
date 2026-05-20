import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Category } from '../types/Category';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  category: Category;
  totalCards: number;
}

export default function CategoryCard({ category, totalCards }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/category/${category.id}`)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
        <Ionicons name={category.icon as any} size={24} color={category.color} />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{category.name}</Text>
        <Text style={styles.count}>{totalCards} cards</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  count: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
});
