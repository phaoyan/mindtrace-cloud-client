import axios from "axios";
import {ENHANCER_HOST} from "./EnhancerApi";
import {Resource} from "../../components/Main/InfoRight/EnhancerPanel/EnhancerCard/EnhancerCardHooks";


export const addResource = async (enhancerId: number, data: any): Promise<Resource>=>{
    return await axios.post(`${ENHANCER_HOST}/enhancer/${enhancerId}/resource`, data).then(({data})=>data)
}

export const addEnhancerResourceRel = async (enhancerId: number, resourceId: number)=>{
    await axios.put(`${ENHANCER_HOST}/rel/enhancer/resource?enhancerId=${enhancerId}&resourceId=${resourceId}`)
}
export const getResourcesFromEnhancer = async (enhancerId: number): Promise<Resource[]> =>{
    return await axios.get(`${ENHANCER_HOST}/enhancer/${enhancerId}/resource`).then(({data})=>data)
}

export const getResourceById = async (resourceId: number): Promise<Resource>=>{
    return await axios.get(`${ENHANCER_HOST}/resource/${resourceId}/meta`).then(({data})=>data)
}

export const searchSimilarResource = async (txt: string, threshold: number): Promise<{id: number, score: number}[]>=>{
    return await axios.get(`${ENHANCER_HOST}/resource/similar?txt=${txt}&threshold=${threshold}`).then(({data})=>data)
}

export const getResourceBatch = async (resourceIds: number[]): Promise<Resource[]>=>{
    return await axios.post(`${ENHANCER_HOST}/batch/resource/meta`, resourceIds).then(({data})=>data)
}

export const addDataToResource = async (resourceId: number, dataName: string, data: any, contentType?: string)=>{
    await axios.post(`${ENHANCER_HOST}/resource/${resourceId}/data/${dataName}`, data || " ", {headers:{"Content-Type": contentType || "text/plain"}})
}

export const getAllDataFromResource = async (resourceId: number): Promise<any> =>{
    return await axios.get(`${ENHANCER_HOST}/resource/${resourceId}/data`).then(({data})=>data)
}

export const getDataFromResource = async (resourceId:number, dataName: string): Promise<any>=>{
    return await axios.get(`${ENHANCER_HOST}/resource/${resourceId}/data/${dataName}`).then(({data})=>data)
}

export const removeResource = async (resourceId: number): Promise<any>=>{
    return await axios.delete(`${ENHANCER_HOST}/resource/${resourceId}`)
}

export const removeResourceFromEnhancerGroup = async (groupId: number, resourceId: number)=>{
    await axios.delete(`${ENHANCER_HOST}/enhancer-group/${groupId}/resource/${resourceId}`)
}