import { UserData } from "../types/User"
import { users } from "./mockData"

export type ResponseAuth = {
    success:boolean;
    error?:{
        message:string;
    }
}

export function registerService(user:UserData):ResponseAuth{
    const userFind = findUserByEmail(user.email);

    if(userFind){
        return {
            success:false,
            error:{
                message:"Email já existe"
            }
        }
    }

    users.push(user);

    return {
        success:true
    }
}


export function loginService(user:UserData):ResponseAuth{
    const userFind = findUserByEmail(user.email);

    if(!userFind || user.password != userFind.password){
        return{
            success:false,
            error:{
                message:"Email ou senha inválidos"
            }
        }
    }

    return {
        success:true
    }
}

function findUserByEmail(email:string){
    const user = users.find((u: UserData)=> u?.email?.trim().toLowerCase() === email?.trim().toLowerCase());

    return user;
}