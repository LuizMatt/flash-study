import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import Field, { FieldProps } from "./field";
import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../../../src/context/AuthContext";
import { useApp } from "../../../src/context/AppContext";

interface AuthFormProps {
  type: "login" | "register";
  inputs: FieldProps[];
}

function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "A senha deve ter no mínimo 8 caracteres";
  }
  if (!/[A-Z]/.test(password)) {
    return "A senha deve conter pelo menos uma letra maiúscula";
  }
  if (!/[a-z]/.test(password)) {
    return "A senha deve conter pelo menos uma letra minúscula";
  }
  if (!/[0-9]/.test(password)) {
    return "A senha deve conter pelo menos um número";
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return "A senha deve conter pelo menos um caractere especial (!@#$%^&*)";
  }
  return null;
}

export default function AuthForm({ type, inputs }: AuthFormProps) {
  const { login, register } = useAuth();
  const { loadData } = useApp();
  const router = useRouter();

  const [fields, setFields] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(id: string, value: string) {
    setFields((prev) => ({ ...prev, [id]: value }));
  }

  const isLogin = type === "login";
  const href = isLogin ? "/register" : "/login";

  async function handleSubmit() {
    // Validação no frontend
    if (!isLogin) {
      if (!fields.name?.trim()) {
        const message = "Por favor, preencha o nome";
        Platform.OS === "web" ? alert(message) : Alert.alert("Erro", message);
        return;
      }
      const passwordError = validatePassword(fields.password ?? "");
      if (passwordError) {
        Platform.OS === "web" ? alert(passwordError) : Alert.alert("Erro", passwordError);
        return;
      }
    }

    if (!fields.email?.trim()) {
      const message = "Por favor, preencha o email";
      Platform.OS === "web" ? alert(message) : Alert.alert("Erro", message);
      return;
    }

    if (!fields.password?.trim()) {
      const message = "Por favor, preencha a senha";
      Platform.OS === "web" ? alert(message) : Alert.alert("Erro", message);
      return;
    }

    try {
      setIsSubmitting(true);
      if (isLogin) {
        await login(fields.email ?? "", fields.password ?? "");
      } else {
        await register(
          fields.name ?? "",
          fields.email ?? "",
          fields.password ?? "",
        );
      }
      await loadData();
      router.replace("/(tabs)/review");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? 
        err?.message ?? 
        "Erro ao processar a requisição. Verifique se o servidor está rodando.";
      if (Platform.OS === "web") {
        alert(message);
      } else {
        Alert.alert("Erro", message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0f172a",
        padding: 20,
      }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 400,
          backgroundColor: "#1e293b",
          borderRadius: 20,
          padding: 24,
          borderWidth: 1,
          borderColor: "#334155",
          gap: 18,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 28,
            fontWeight: "700",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          {isLogin ? "Entrar" : "Criar conta"}
        </Text>

        {inputs.map((input) => (
          <Field
            key={input.id}
            label={input.label}
            placeholder={input.placeholder}
            onChange={(value) => handleChange(input.id, value)}
          />
        ))}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={{
            backgroundColor: "#3b82f6",
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            marginTop: 10,
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={{
                color: "#fff",
                fontWeight: "600",
                fontSize: 16,
              }}
            >
              {isLogin ? "Entrar" : "Cadastrar"}
            </Text>
          )}
        </TouchableOpacity>

        <Link
          href={href}
          style={{
            marginTop: 12,
            textAlign: "center",
            color: "#60a5fa",
            fontSize: 14,
            fontWeight: "500",
          }}
        >
          {isLogin ? "Criar conta" : "Já tenho conta"}
        </Link>

        {!isLogin && (
          <View
            style={{
              marginTop: 16,
              padding: 12,
              backgroundColor: "#334155",
              borderRadius: 8,
              borderLeftWidth: 3,
              borderLeftColor: "#60a5fa",
            }}
          >
            <Text
              style={{
                color: "#e2e8f0",
                fontSize: 12,
                fontWeight: "600",
                marginBottom: 6,
              }}
            >
              Requisitos da senha:
            </Text>
            <Text style={{ color: "#cbd5e1", fontSize: 11, marginBottom: 2 }}>
              • Mínimo 8 caracteres
            </Text>
            <Text style={{ color: "#cbd5e1", fontSize: 11, marginBottom: 2 }}>
              • Pelo menos uma letra maiúscula (A-Z)
            </Text>
            <Text style={{ color: "#cbd5e1", fontSize: 11, marginBottom: 2 }}>
              • Pelo menos uma letra minúscula (a-z)
            </Text>
            <Text style={{ color: "#cbd5e1", fontSize: 11, marginBottom: 2 }}>
              • Pelo menos um número (0-9)
            </Text>
            <Text style={{ color: "#cbd5e1", fontSize: 11 }}>
              • Pelo menos um caractere especial (!@#$%^&*)
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
