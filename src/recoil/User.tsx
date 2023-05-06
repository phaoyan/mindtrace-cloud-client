import {atom, selector} from "recoil";
import {defaultUserShare, UserShare} from "../service/data/share/UserShare";

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

export const IsLogin = selector<boolean>({
    key: "IsLogin",
    get: ({get})=>get(UserID) !== -1
})

export const UserShareAtom = atom<UserShare>({
    key: "UserShareAtom",
    default: defaultUserShare
})
export const UserPublicSelector = selector<boolean>({
    key: "UserPublicSelector",
    get: ({get})=>!!get(UserShareAtom)
})