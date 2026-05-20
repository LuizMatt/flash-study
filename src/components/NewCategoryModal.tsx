import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import {
  CATEGORY_ICONS,
  DEFAULT_CATEGORY_ICON,
  CategoryIconName,
} from '../constants/categoryIcons';

const COLORS = ['#2563EB', '#16A34A', '#F97316', '#DB2777', '#7C3AED', '#0891B2'];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function NewCategoryModal({ visible, onClose }: Props) {
  const { state, dispatch } = useApp();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState<CategoryIconName>(DEFAULT_CATEGORY_ICON);
  const [error, setError] = useState('');

  const resetForm = () => {
    setName('');
    setSelectedColor(COLORS[0]);
    setSelectedIcon(DEFAULT_CATEGORY_ICON);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Informe o nome da categoria.');
      return;
    }

    const categoryAlreadyExists = state.categories.some(
      (category) => category.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (categoryAlreadyExists) {
      setError('Já existe uma categoria com esse nome.');
      return;
    }

    dispatch({
      type: 'ADD_CATEGORY',
      payload: {
        id: Date.now().toString(),
        name: trimmedName,
        color: selectedColor,
        icon: selectedIcon,
        createdAt: new Date(),
      },
    });

    handleClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrapper}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Nova categoria</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color="#1C1C1E" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Nome</Text>
          <TextInput
            value={name}
            onChangeText={(value) => {
              setName(value);
              setError('');
            }}
            placeholder="Ex: Matemática"
            placeholderTextColor="#8E8E93"
            style={styles.input}
            returnKeyType="done"
          />

          <Text style={styles.label}>Cor</Text>
          <View style={styles.colorRow}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColor,
                ]}
                onPress={() => setSelectedColor(color)}
                activeOpacity={0.8}
              >
                {selectedColor === color && <Ionicons name="checkmark" size={18} color="#FFF" />}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Ícone</Text>
          <View style={styles.iconGrid}>
            {CATEGORY_ICONS.map((icon) => {
              const isSelected = selectedIcon === icon.name;

              return (
                <TouchableOpacity
                  key={icon.name}
                  style={[
                    styles.iconOption,
                    isSelected && {
                      borderColor: selectedColor,
                      backgroundColor: selectedColor + '12',
                    },
                  ]}
                  onPress={() => setSelectedIcon(icon.name)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`Selecionar ícone ${icon.label}`}
                >
                  <Ionicons
                    name={icon.name}
                    size={22}
                    color={isSelected ? selectedColor : '#6B7280'}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={[styles.saveButton, { backgroundColor: selectedColor }]} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Salvar categoria</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  sheetWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 34,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#1C1C1E',
    marginBottom: 18,
    backgroundColor: '#FFFFFF',
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  colorOption: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#1C1C1E',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 13,
    marginBottom: 12,
  },
  saveButton: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
