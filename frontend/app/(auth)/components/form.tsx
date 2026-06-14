import { View, Text, TouchableOpacity, Platform, Alert } from "react-native";
import Field, { FieldProps } from "./field";
import { UserData } from "../../../src/types/User";
import { useState } from "react";
import { Link } from "expo-router";
import { loginService, registerService } from "../../../src/data/serviceMock";
import { useAuth } from "../../../src/context/AuthContext";

interface AuthFormProps {
  type: "login" | "register";
  inputs: FieldProps[];
}

export default function AuthForm({
  type,
  inputs,
}: AuthFormProps) {
  const {login} = useAuth();

  const [user, setUser] = useState<UserData>({
    email:'',
    name:'',
    password:''
  });

  function handleChange(label: string, value: string) {
    setUser((prev) => ({
      ...prev,
      [label]: value,
    }));
  }

  const isLogin = type === "login";

  const href = isLogin ? "/register" : "/login";

  function handleSubmit() {
      const {success,error} = isLogin ? loginService(user) : registerService(user);
      
      if(error || !success){
          if(Platform.OS === "web"){
              alert(error?.message ?? "Erro");
          }else{
              Alert.alert(error?.message ?? "Erro");
          }

          return;
      }

      login(user);
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
          {type === "login" ? "Entrar" : "Criar conta"}
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
          style={{
            backgroundColor: "#3b82f6",
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "600",
              fontSize: 16,
            }}
          >
            {isLogin ? "Entrar" : "Cadastrar"}
          </Text>
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

      </View>
    </View>
  );
}