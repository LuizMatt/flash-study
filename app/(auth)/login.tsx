import { Alert, Platform } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { loginService } from "../../src/data/serviceMock";
import { UserData } from "../../src/types/User";
import { FieldProps } from "./components/field";
import AuthForm from "./components/form";

const inputs:FieldProps[]  = [
    {
        id:"email",
        label: 'Email',
        placeholder: 'joão@gmail.com'
    },
    {
        id:"password",
        label: 'Senha',
        placeholder: '******'
    }
]

export default function LoginPage(){

    return (
        <AuthForm 
            inputs={inputs} type="login"
        />
    )
}