import {Enhancer} from "../data/Enhancer";
import axios from "axios";
import {BACK_HOST} from "../utils/constants";

export const ENHANCER_HOST = `${BACK_HOST}/enhancer`

export const getEnhancerById = async (enhancerId: number): Promise<Enhancer>=>{
    return await axios.get(`${ENHANCER_HOST}/enhancer/${enhancerId}`).then(({data})=>data)
}

export const getEnhancersForKnode = async (knodeId: number): Promise<Enhancer[]>=>{
    return await axios.get(`${ENHANCER_HOST}/knode/${knodeId}/enhancer`).then(({data})=>data)
}

export const getEnhancersForOffsprings = async (knodeId: number): Promise<Enhancer[]>=>{
    return await axios.get(`${ENHANCER_HOST}/knode/${knodeId}/offspring/enhancer`).then(({data})=>data)
}

export const addEnhancerToKnode = async (knodeId: number): Promise<Enhancer> =>{
    return await axios.put(`${ENHANCER_HOST}/knode/${knodeId}/enhancer`)
        .then(({data})=>{
            // console.log("ADD ENHANCER TO KNODE", data)
            return data
        })
}

export const updateEnhancer = async (enhancerId: number, enhancer: Enhancer)=>{
    return await axios.post(`${ENHANCER_HOST}/enhancer/${enhancerId}`, enhancer)
}

export const removeEnhancer = async (enhancerId: number)=>{
    return await axios.delete(`${ENHANCER_HOST}/enhancer/${enhancerId}`).then(({data})=> {
        // console.log("remove enhancer from user", data)
        return data
    })
}

export const scissorEnhancer = async (enhancerId:number, oriKnodeId: number, tarKnodeId: number)=>{
    console.log("scissor enhancer", enhancerId, oriKnodeId, tarKnodeId)
    await axios.post(`${ENHANCER_HOST}/knode/${tarKnodeId}/enhancer/${enhancerId}`)
    await axios.delete(`${ENHANCER_HOST}/knode/${oriKnodeId}/enhancer/${enhancerId}`)
}

export const getEnhancerCount = async (knodeId: number)=>{
    return await axios.get(`${ENHANCER_HOST}/knode/${knodeId}/enhancer/count`).then(({data})=>data)
}