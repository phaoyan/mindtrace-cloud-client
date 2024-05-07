import {Enhancer} from "../data/Enhancer";
import axios from "axios";
import {BACK_HOST} from "../utils/constants";
import {Knode} from "../data/Knode";
import {EnhancerGroup} from "../../components/Main/InfoRight/EnhancerPanel/EnhancerGroupCard/EnhancerGroupCardHooks";
import {Resource} from "../../components/Main/InfoRight/EnhancerPanel/EnhancerCard/EnhancerCardHooks";

export const ENHANCER_HOST = `${BACK_HOST}/enhancer`

export const getEnhancerById = async (enhancerId: number): Promise<Enhancer>=>{
    return await axios.get(`${ENHANCER_HOST}/enhancer/${enhancerId}`).then(({data})=>data)
}

export const getEnhancersByLike = async (userId: number, txt: string):Promise<Enhancer[]>=>{
    return await axios.get(`${ENHANCER_HOST}/like/user/${userId}/enhancer?txt=${txt}`).then(({data})=>data)
}

export const getEnhancersByResourceId = async (resourceId: number): Promise<Enhancer[]>=>{
    return await axios.get(`${ENHANCER_HOST}/enhancer/resource/${resourceId}`).then(({data})=>data)
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
    if(oriKnodeId===tarKnodeId) return
    await axios.post(`${ENHANCER_HOST}/knode/${tarKnodeId}/enhancer/${enhancerId}`)
    await axios.delete(`${ENHANCER_HOST}/knode/${oriKnodeId}/enhancer/${enhancerId}`)
}

export const copyEnhancer = async (enhancerId:number, tarKnodeId: number)=>{
    await axios.post(`${ENHANCER_HOST}/knode/${tarKnodeId}/enhancer/${enhancerId}`)
}

export const getEnhancerCount = async (knodeId: number)=>{
    return await axios.get(`${ENHANCER_HOST}/knode/${knodeId}/enhancer/count`).then(({data})=>data)
}

export const getKnodesByEnhancerId = async (enhancerId: number): Promise<Knode[]>=>{
    return await axios.get(`${ENHANCER_HOST}/enhancer/${enhancerId}/knode`).then(({data})=>data)
}

export const setEnhancerIndexInKnode = async (knodeId: number, enhancerId: number, index: number) =>{
    return await axios.post(`${ENHANCER_HOST}/rel/knode/enhancer/index?knodeId=${knodeId}&enhancerId=${enhancerId}&index=${index}`)
}

export const setResourceIndexInEnhancer = async (enhancerId: number, resourceId: number, index: number) =>{
    return await axios.post(`${ENHANCER_HOST}/rel/enhancer/resource/index?enhancerId=${enhancerId}&resourceId=${resourceId}&index=${index}`)
}

export const getEnhancerGroupById = async (groupId: number):Promise<EnhancerGroup>=>{
    return await axios.get(`${ENHANCER_HOST}/enhancer-group/${groupId}`).then(({data})=>data)
}

export const getEnhancerGroupsByEnhancerId = async (enhancerId: number): Promise<number[]>=>{
    return await axios.get(`${ENHANCER_HOST}/rel/enhancer/${enhancerId}/enhancer-group/id`).then(({data})=>data)
}

export const getRelatedEnhancerIdsByGroupId = async (groupId: number): Promise<number[]>=>{
    return await axios.get(`${ENHANCER_HOST}/rel/enhancer-group/${groupId}/enhancer/id`).then(({data})=>data)
}

export const getEnhancersByGroupId = async (groupId: number): Promise<Enhancer[]>=>{
    return await axios.get(`${ENHANCER_HOST}/rel/enhancer-group/${groupId}/enhancer`).then(({data})=>data)

}

export const getResourcesByGroupId = async (groupId: number): Promise<Resource[]>=>{
    return await axios.get(`${ENHANCER_HOST}/rel/enhancer-group/${groupId}/resource`).then(({data})=>data)
}

export const addEnhancerGroupToKnode = async (userId: number, knodeId: number)=>{
    return await axios.put(`${ENHANCER_HOST}/user/${userId}/knode/${knodeId}/enhancer-group`)
}

export const addEnhancerGroupRel = async (enhancerId: number, groupId: number)=>{
    return await axios.put(`${ENHANCER_HOST}/rel/enhancer-group/enhancer?enhancerId=${enhancerId}&groupId=${groupId}`)
}

export const setEnhancerGroupTitle = async (groupId: number, title: string)=>{
    await axios.put(`${ENHANCER_HOST}/enhancer-group/${groupId}/title?title=${title}`)
}

export const setEnhancerIndexInEnhancerGroup = async (groupId: number, enhancerId: number, index: number)=>{
    await axios.put(`${ENHANCER_HOST}/enhancer-group/${groupId}/enhancer/${enhancerId}/index?index=${index}`)
}

export const addResourceToEnhancerGroup = async (groupId: number, userId: number, type: string)=>{
    return await axios.put(`${ENHANCER_HOST}/enhancer-group/${groupId}/resource?userId=${userId}&type=${type}`).then(({data})=>data)
}

export const removeEnhancerGroup = async (groupId: number)=>{
    await axios.delete(`${ENHANCER_HOST}/enhancer-group/${groupId}`)
}

export const removeEnhancerGroupRel = async (enhancerId: number, groupId: number)=>{
    await axios.delete(`${ENHANCER_HOST}/rel/enhancer-group/${groupId}/enhancer/${enhancerId}`)
}

export const getEnhancerGroupsByKnodeId = async (knodeId: number): Promise<EnhancerGroup[]>=>{
    return await axios.get(`${ENHANCER_HOST}/rel/knode/${knodeId}/enhancer-group`).then(({data})=>data)
}