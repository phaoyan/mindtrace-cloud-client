import axios from "axios";
import {ENHANCER_HOST} from "./EnhancerApi";
import {Resource} from "../../components/Main/InfoRight/EnhancerPanel/EnhancerCard/EnhancerCardHooks";


export const addResource = async (enhancerId: number, data: any): Promise<Resource>=>{
    return await axios.post(`${ENHANCER_HOST}/enhancer/${enhancerId}/resource`, data).then(({data})=>data)
}
export const getResourcesFromEnhancer = async (enhancerId: number): Promise<Resource[]> =>{
    return await axios.get(`${ENHANCER_HOST}/enhancer/${enhancerId}/resource`).then(({data})=>data)
}

export const getResourceById = async (resourceId: number): Promise<Resource>=>{
    return await axios.get(`${ENHANCER_HOST}/resource/${resourceId}/meta`).then(({data})=>data)
}

export const addDataToResource = async (resourceId: number, dataName: string, data: any, contentType?: string)=>{
    await axios.post(`${ENHANCER_HOST}/resource/${resourceId}/data/${dataName}`, data || " ", {headers:{"Content-Type": contentType || "text/plain"}})
}

export const getAllDataFromResource = async (resourceId: number): Promise<any> =>{
    return await axios.get(`${ENHANCER_HOST}/resource/${resourceId}/data`).then(({data})=>data)
}

export const removeResource = async (resourceId: number): Promise<any>=>{
    return await axios.delete(`${ENHANCER_HOST}/resource/${resourceId}`)
}