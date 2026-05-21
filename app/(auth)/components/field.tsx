import { Text, TextInput, View } from "react-native";

export interface FieldProps {
  id:string;
  label: string;
  placeholder?: string;
  onChange?:(value:string) => void
}

export default function Field({
  label,
  placeholder,
  onChange
}: Omit<FieldProps, "id">) {
  const isEmail = label.toLowerCase().includes("email");
  const isPassword = label.toLowerCase().includes("senha") || label.toLowerCase().includes("password");

  return (
    <View
      style={{
        gap: 8,
        marginBottom: 18,
      }}
    >
      <Text
        style={{
          color: "#e2e8f0",
          fontSize: 15,
          fontWeight: "600",
          marginLeft: 4,
        }}
        
      >
        {label}
      </Text>

      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        secureTextEntry={isPassword}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={isEmail ? "email-address" : "default"}
        style={{
          backgroundColor: "#0f172a",
          borderWidth: 1,
          borderColor: "#334155",
          borderRadius: 14,
          paddingVertical: 14,
          paddingHorizontal: 16,
          color: "#fff",
          fontSize: 16,
        }}
        onChangeText={(text)=> {
          if(onChange){
            onChange(text);
          }
        }}
      />
    </View>
  );
}