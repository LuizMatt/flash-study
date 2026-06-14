import React, { useContext, useState } from "react";
import { User, UserData } from "../types/User";
import { useRouter } from "expo-router";

type AuthContextType = {
    user:User | null,
    login:(user:UserData)=> void,
    logout:() => void;
}

const AuthContext = React.createContext({} as AuthContextType);

export default function AuthContextProvider({children}:{children:React.ReactNode}){

    const router = useRouter();

    const [user,setUser] = useState<User | null> (null);

    function login(userData:UserData){
        if(!userData){
            return;
        }

        const userLogin:User = {
            email:userData.email,
            name:userData.name
        };

        setUser(userLogin);

        router.replace("/categories");
    }

    function logout(){
        setUser(null);
    }
    
    return <AuthContext.Provider value={{user,login,logout}}>
        {children}
    </AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext);