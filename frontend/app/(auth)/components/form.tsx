import { View, Text, TouchableOpacity, Platform, Alert, ActivityIndicator } from 'react-native';
import Field, { FieldProps } from './field';
import { useState } from 'react';
import { Link } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';

interface AuthFormProps {
  type: 'login' | 'register';
  inputs: FieldProps[];
}

type FormState = Record<string, string>;
type FormErrors = Record<string, string>;

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm(form: FormState, isLogin: boolean): FormErrors {
  const errors: FormErrors = {};

  if (!isLogin) {
    if (!form.name?.trim()) {
      errors.name = 'Nome é obrigatório';
    }
  }

  if (!form.email?.trim()) {
    errors.email = 'Email é obrigatório';
  } else if (!validateEmail(form.email)) {
    errors.email = 'Email inválido';
  }

  if (!form.password?.trim()) {
    errors.password = 'Senha é obrigatória';
  } else if (!isLogin && form.password.length < 8) {
    errors.password = 'Senha deve ter no mínimo 8 caracteres';
  }

  return errors;
}

export default function AuthForm({ type, inputs }: AuthFormProps) {
  const { login, register } = useAuth();

  const [form, setForm] = useState<FormState>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const isLogin = type === 'login';
  const href = isLogin ? '/register' : '/login';

  function handleChange(id: string, value: string) {
    setForm((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
  }

  async function handleSubmit() {
    const validationErrors = validateForm(form, isLogin);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password });
      } else {
        await register({ name: form.name, email: form.email, password: form.password });
      }
    } catch (err: any) {
      const message = err?.message ?? 'Ocorreu um erro. Tente novamente.';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Erro', message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        padding: 20,
      }}
    >
      <View
        style={{
          width: '100%',
          maxWidth: 400,
          backgroundColor: '#1e293b',
          borderRadius: 20,
          padding: 24,
          borderWidth: 1,
          borderColor: '#334155',
          gap: 18,
        }}
      >
        <Text
          style={{
            color: '#fff',
            fontSize: 28,
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: 10,
          }}
        >
          {isLogin ? 'Entrar' : 'Criar conta'}
        </Text>

        {inputs.map((input) => (
          <View key={input.id}>
            <Field
              label={input.label}
              placeholder={input.placeholder}
              onChange={(value) => handleChange(input.id, value)}
            />
            {errors[input.id] ? (
              <Text style={{ color: '#f87171', fontSize: 13, marginTop: -12, marginLeft: 4 }}>
                {errors[input.id]}
              </Text>
            ) : null}
          </View>
        ))}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#2563eb' : '#3b82f6',
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 10,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
              {isLogin ? 'Entrar' : 'Cadastrar'}
            </Text>
          )}
        </TouchableOpacity>

        <Link
          href={href}
          style={{
            marginTop: 12,
            textAlign: 'center',
            color: '#60a5fa',
            fontSize: 14,
            fontWeight: '500',
          }}
        >
          {isLogin ? 'Criar conta' : 'Já tenho conta'}
        </Link>
      </View>
    </View>
  );
}