import axios from "axios";
import {BACK_HOST} from "../utils/constants";

export const LOCAL_HOST = `${BACK_HOST}/local`
export const serializeAll = async (knodeId: number)=>{
    return axios.get(`${LOCAL_HOST}/knode/${knodeId}/all`).then(({data})=>data)
}