import axios from "axios";
import {RESULT} from "../../constants";
export const GATEWAY_HOST = "http://localhost:34443"

export const login = async (username: string, password: string): Promise<any>=>{
    return await axios.post(`${GATEWAY_HOST}/user/login`, {username: username, password: password})
        .then(({data})=>{
            console.log("login: ", data)
            return data
        })
}

export const logout = async ()=>{
    return await axios.post(`${GATEWAY_HOST}/user/logout`)
        .then(({data})=>{
            console.log("logout: ", data)
            return data.code === RESULT.OK;
        })
}

export const register = ()=>{

}