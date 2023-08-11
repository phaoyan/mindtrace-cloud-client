import axios from "axios";
import {BACK_HOST} from "../utils/constants";
import {User} from "../data/Gateway";

export const login = async (username: string, password: string): Promise<any>=>{
    return await axios.post(`${BACK_HOST}/user/login`, {username: username, password: password}).then(({data})=>data)
}

export const logout = async ()=>{
    return await axios.post(`${BACK_HOST}/user/logout`).then(({data})=>data.code === 200)
}

export const sendValidateCode = async (email: string): Promise<{code: number, msg: string, data:any}>=>{
    return await axios.post(`${BACK_HOST}/user/register/validate?email=${email}`).then(({data})=>data)
}

export const registerConfirm = async (
    username: string,
    password: string,
    email: string,
    code: number):
    Promise<{code: number, msg: string, data: any}>=>{
    return await axios.post(
        `${BACK_HOST}/user/register/confirm?validate=${code}`,
        {username: username, password: password, email: email})
        .then(({data})=>data)
}

export const getLoginData = async (): Promise<User>=>{
    return await axios.get(`${BACK_HOST}/user`).then(({data})=>data)
}
export const getUserPublicInfo = async (userId: number): Promise<User>=>{
    return await axios.get(`${BACK_HOST}/user/${userId}`).then(({data})=>data)
}

export const getUserInfoByLike = async (like: string)=>{
    return await axios.get(`${BACK_HOST}/like/user?like=${like}`).then(({data})=>data)
}

export const changePassword = async (userId: number, oriPassword: string, newPassword: string)=>{
    return await axios.post(`${BACK_HOST}/user/${userId}/password?oriPassword=${oriPassword}&newPassword=${newPassword}`).then(({data})=>data)
}