import {Enhancer} from "../data/Enhancer";
import axios from "axios";
import {BACK_HOST, RESULT} from "../../constants";

export const ENHANCER_HOST = `${BACK_HOST}/enhancer`

export const getEnhancersForKnode = async (userId: number, knodeId: number): Promise<Enhancer[]>=>{
    return await axios.get(`${ENHANCER_HOST}/user/${userId}/knode/${knodeId}/enhancer`)
        .then(({data})=>{
            console.log(`Get Enhancers For Knode ${knodeId}`,data);
            if(data.code===RESULT.OK)
                return data.data
            else return []
        })
}

export const updateEnhancer = async (userId: number, enhancerId: number, enhancer: Enhancer)=>{
    return await axios.post(`${ENHANCER_HOST}/user/${userId}/enhancer/${enhancerId}`, enhancer)
}

export const removeEnhancer = async (userId: number, enhancerId: number)=>{
    return await axios.delete(`${ENHANCER_HOST}/user/${userId}/enhancer/${enhancerId}`)
}