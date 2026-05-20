import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useApp } from '../../src/context/AppContext';

export default function CreateScreen() {
  const { categoryId: initialCategoryId } = useLocalSearchParams<{ categoryId?: string }>();
  const { state, dispatch } = useApp();
  const { categories } = state;
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [categoryId, setCategoryId] = useState(initialCategoryId ?? categories[0]?.id ?? '');
  const [appliedRouteCategoryId, setAppliedRouteCategoryId] = useState(initialCategoryId ?? '');
  const [error, setError] = useState('');
  const [savedMessageVisible, setSavedMessageVisible] = useState(false);

  useEffect(() => {
    const routeCategoryExists = categories.some((category) => category.id === initialCategoryId);

    if (
      initialCategoryId &&
      routeCategoryExists &&
      appliedRouteCategoryId !== initialCategoryId
    ) {
      setCategoryId(initialCategoryId);
      setAppliedRouteCategoryId(initialCategoryId);
      return;
    }

    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [appliedRouteCategoryId, categories, categoryId, initialCategoryId]);

  const handleSave = () => {
    const trimmedFront = front.trim();
    const trimmedBack = back.trim();

    if (!trimmedFront || !trimmedBack) {
      setError('Preencha a frente e o verso do card.');
      return;
    }

    if (!categoryId) {
      setError('Selecione uma categoria.');
      return;
    }

    dispatch({
      type: 'ADD_CARD',
      payload: {
        id: Date.now().toString(),
        categoryId,
        front: trimmedFront,
        back: trimmedBack,
        learned: false,
        createdAt: new Date(),
      },
    });

    Keyboard.dismiss();
    setFront('');
    setBack('');
    setError('');
    setSavedMessageVisible(true);

    setTimeout(() => {
      setSavedMessageVisible(false);
    }, 2000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.safeArea}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Criar Flashcard</Text>

        {categories.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="albums-outline" size={32} color="#8E8E93" />
            <Text style={styles.emptyText}>Crie uma categoria antes de adicionar cards.</Text>
          </View>
        ) : (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Frente</Text>
              <TextInput
                value={front}
                onChangeText={(value) => {
                  setFront(value);
                  setError('');
                }}
                placeholder="Pergunta ou termo"
                placeholderTextColor="#8E8E93"
                style={styles.input}
                multiline
              />
            </View>

            <View style={styles.previewCard}>
              <Text style={styles.previewLabel}>Preview</Text>
              <Text style={styles.previewText}>{front || 'A frente do card aparece aqui'}</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Verso</Text>
              <TextInput
                value={back}
                onChangeText={(value) => {
                  setBack(value);
                  setError('');
                }}
                placeholder="Resposta"
                placeholderTextColor="#8E8E93"
                style={[styles.input, styles.backInput]}
                multiline
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Categoria</Text>
              <View style={styles.categoryList}>
                {categories.map((category) => {
                  const isSelected = category.id === categoryId;

                  return (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryOption,
                        isSelected && {
                          borderColor: category.color,
                          backgroundColor: category.color + '12',
                        },
                      ]}
                      onPress={() => {
                        setCategoryId(category.id);
                        setError('');
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                      <Text style={styles.categoryName}>{category.name}</Text>
                      {isSelected && <Ionicons name="checkmark-circle" size={20} color={category.color} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {savedMessageVisible ? <Text style={styles.successText}>Card salvo!</Text> : null}

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
              <Ionicons name="save-outline" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Salvar card</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    padding: 20,
    paddingBottom: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 10,
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  input: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#1C1C1E',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
  },
  backInput: {
    minHeight: 96,
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 18,
    minHeight: 116,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F2F2F7',
    marginBottom: 18,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  previewText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  categoryList: {
    gap: 10,
  },
  categoryOption: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: 14,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 12,
  },
  successText: {
    color: '#16A34A',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  saveButton: {
    height: 54,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
});
