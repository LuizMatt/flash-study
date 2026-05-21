import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { Plus, FolderPlus } from 'lucide-react-native';
import { router } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import CategoryCard from '../../src/components/CategoryCard';
import NewCategoryModal from '../../src/components/NewCategoryModal';

export default function CategoriesScreen() {
  const { state } = useApp();
  const { categories, flashcards } = state;
  const [isModalVisible, setIsModalVisible] = useState(false);

  const renderItem = ({ item }: { item: typeof categories[0] }) => {
    const categoryCards = flashcards.filter((f) => f.categoryId === item.id);
    const totalCount = categoryCards.length;
    const learnedCount = categoryCards.filter((f) => f.learned).length;

    return (
      <CategoryCard
        category={item}
        learnedCount={learnedCount}
        totalCount={totalCount}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Meus Cards</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsModalVisible(true)}
            activeOpacity={0.7}
          >
            <FolderPlus size={20} color="#1C1C1E" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum card encontrado.</Text>
            </View>
          }
        />
      </View>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/create')}
        activeOpacity={0.8}
      >
        <Plus size={18} color="#FFFFFF" style={styles.fabIcon} />
        <Text style={styles.fabText}>Novo</Text>
      </TouchableOpacity>
      <NewCategoryModal visible={isModalVisible} onClose={() => setIsModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, fontWeight: 'bold' }
});
