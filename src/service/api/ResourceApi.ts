import axios from "axios";
import {ENHANCER_HOST} from "./EnhancerApi";
import {KnodeData} from "../../components/Main/InfoRight/EnhancerPanel/resource/UnfoldingPlayer";
import {Resource, ResourceWithData} from "../../components/Main/InfoRight/EnhancerPanel/EnhancerCard/EnhancerCardHooks";


export const addResourceToEnhancer = async (
    enhancerId: number,
    resourceWithData: ResourceWithData): Promise<Resource> =>{
    return await axios({
        method: "PUT",
        url: `${ENHANCER_HOST}/enhancer/${enhancerId}/resource`,
        data: resourceWithData
    }).then(({data})=>data)
}


export const getResourcesFromEnhancer = async (enhancerId: number): Promise<Resource[]> =>{
    return await axios.get(`${ENHANCER_HOST}/enhancer/${enhancerId}/resource`).then(({data})=>data)
}

export const getResourceById = async (resourceId: number): Promise<Resource>=>{
    return await axios.get(`${ENHANCER_HOST}/resource/${resourceId}/meta`).then(({data})=>data)
}

export const addDataToResource = async (resourceId: number, data: object)=>{
    await axios.post(`${ENHANCER_HOST}/resource/${resourceId}/data`, data)
}

export const getAllDataFromResource = async (resourceId: number): Promise<any> =>{
    return await axios.get(`${ENHANCER_HOST}/resource/${resourceId}/data`).then(({data})=>data)
}

export const removeResource = async (resourceId: number): Promise<any>=>{
    return await axios.delete(`${ENHANCER_HOST}/resource/${resourceId}`)
}

export const getUnfoldingKnodeData = async (rootId: number): Promise<KnodeData[]>=>{
    return await axios.get(`${ENHANCER_HOST}/resource/serv/unfolding?rootId=${rootId}`).then(({data})=>data)
}