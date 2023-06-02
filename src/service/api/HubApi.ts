import {BACK_HOST} from "../../constants";
import axios from "axios";

export const HUB_HOST = `${BACK_HOST}/hub`
export const pushToHub = async (userId: number)=>{
    return await axios.post(`${HUB_HOST}/user/${userId}`).then(({data})=>data)
}

export const existsInHub = async (resourceId: number)=>{
    return await axios.head(`${HUB_HOST}/resource/${resourceId}`).then((data)=>data.status === 200)
}
