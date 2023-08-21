import {Enhancer} from "../data/Enhancer";
import axios from "axios";
import {BACK_HOST} from "../utils/constants";

export const ENHANCER_HOST = `${BACK_HOST}/enhancer`

export const getEnhancerById = async (enhancerId: number): Promise<Enhancer>=>{
    return await axios.get(`${ENHANCER_HOST}/enhancer/${enhancerId}`).then(({data})=>data)
}

export const getEnhancersByDate = async (userId: number, left?: string, right?: string): Promise<Enhancer[]>=>{
    return await axios.get(`${ENHANCER_HOST}/date/enhancer?userId=${userId}&left=${left || ""}&right=${right || ""}`).then(({data})=>data)
}

export const getEnhancersByDateBeneathKnode = async (knodeId: number, left?: string, right?: string): Promise<Enhancer[]>=>{
    return await axios.get(`${ENHANCER_HOST}/date/enhancer?knodeId=${knodeId}&left=${left || ""}&right=${right || ""}`).then(({data})=>data)
}

export const getEnhancersForKnode = async (knodeId: number): Promise<Enhancer[]>=>{
    return await axios.get(`${ENHANCER_HOST}/knode/${knodeId}/enhancer`).then(({data})=>data)
}

export const getEnhancersForOffsprings = async (knodeId: number): Promise<Enhancer[]>=>{
    return await axios.get(`${ENHANCER_HOST}/knode/${knodeId}/offspring/enhancer`).then(({data})=>data)
}

export const addEnhancerToKnode = async (knodeId: number): Promise<Enhancer> =>{
    return await axios.put(`${ENHANCER_HOST}/knode/${knodeId}/enhancer`).then(({data})=> data)
}
export const setEnhancerIsQuiz = async (enhancerId: number, isQuiz: boolean)=>{
    await axios.put(`${ENHANCER_HOST}/enhancer/${enhancerId}/isQuiz?isQuiz=${isQuiz}`)
}

export const setEnhancerTitle = async (enhancerId: number, title: string)=>{
    await axios.put(`${ENHANCER_HOST}/enhancer/${enhancerId}/title?title=${title}`)
}

export const removeEnhancer = async (enhancerId: number, knodeId: number)=>{
    return await axios.delete(`${ENHANCER_HOST}/knode/${knodeId}/enhancer/${enhancerId}`).then(({data})=>data)
}

export const scissorEnhancer = async (enhancerId:number, oriKnodeId: number, tarKnodeId: number)=>{
    await axios.post(`${ENHANCER_HOST}/knode/${tarKnodeId}/enhancer/${enhancerId}`)
    await axios.delete(`${ENHANCER_HOST}/knode/${oriKnodeId}/enhancer/${enhancerId}`)
}

export const copyEnhancer = async (enhancerId:number, tarKnodeId: number)=>{
    await axios.post(`${ENHANCER_HOST}/knode/${tarKnodeId}/enhancer/${enhancerId}`)
}

export const getEnhancerCount = async (knodeId: number)=>{
    return await axios.get(`${ENHANCER_HOST}/knode/${knodeId}/enhancer/count`).then(({data})=>data)
}