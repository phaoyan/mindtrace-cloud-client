import {atom, selector} from "recoil";

export const User = atom<{username:string, password:string, id:number}>({
    key:"User",
    default:{
        username:"",
        password:"",
        id:-1
    }
})

export const UserID = selector<number>({
    key:"UserID",
    get: ({get})=>get(User).id
})