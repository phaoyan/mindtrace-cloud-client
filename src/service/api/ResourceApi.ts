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
    }).then(({data})=>{
        // console.log("add resource to enhancer",data);
        return data
    })
}


export const getResourcesFromEnhancer = async (enhancerId: number): Promise<Resource[]> =>{
    return await axios.get(`${ENHANCER_HOST}/enhancer/${enhancerId}/resource`)
        .then(({data})=>{
            // console.log("get resources from enhancer", data)
            return data
        })
}

export const getResourceById = async (resourceId: number): Promise<Resource>=>{
    return await axios.get(`${ENHANCER_HOST}/resource/${resourceId}/meta`).then(({data})=>data)
}

export const addDataToResource = async (resourceId: number, data: object)=>{
    axios.post(`${ENHANCER_HOST}/resource/${resourceId}/data`, data)
        .then(({data})=>{
            // console.log("add data to resource", data)
        })
}

export const getAllDataFromResource = async (resourceId: number): Promise<any> =>{
    return await axios.get(`${ENHANCER_HOST}/resource/${resourceId}/data`)
        .then(({data})=>{
            // console.log("get all data from resource", data)
            return data
        })
}

export const getDataFromResourceByUrl = async (url: string)=>{
    return await axios.get(url)
        .then(({data})=>{
            // console.log("get data from resource by url", data)
            return data
        })
}

export const removeResource = async (resourceId: number): Promise<any>=>{
    return await axios.delete(`${ENHANCER_HOST}/resource/${resourceId}`)
}

export const getUnfoldingKnodeData = async (rootId: number): Promise<KnodeData[]>=>{
    return await axios.get(`${ENHANCER_HOST}/resource/serv/unfolding?rootId=${rootId}`).then(({data})=>data)
}