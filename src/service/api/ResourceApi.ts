import axios from "axios";
import {ENHANCER_HOST} from "./EnhancerApi";
import {RESULT} from "../../constants";
import {Resource, ResourceWithData} from "../data/Resource";


export const addResourceToEnhancer = async (
    userId: number,
    enhancerId: number,
    resourceWithData: ResourceWithData): Promise<Resource> =>{
    return await axios({
        method: "PUT",
        url: `${ENHANCER_HOST}/user/${userId}/enhancer/${enhancerId}/resource`,
        data: resourceWithData
    }).then(({data})=>{
        console.log("add resource to enhancer",data);
        if(RESULT.OK) return data.data
        else throw Error(data)
    })
}


export const getResourcesFromEnhancer = async (userId: number, enhancerId: number): Promise<Resource[]> =>{
    return await axios.get(`${ENHANCER_HOST}/user/${userId}/enhancer/${enhancerId}/resource`)
        .then(({data})=>{
            // console.log("get resources from enhancer", data)
            if(data.code === RESULT.OK)
                return data.data
            else return []
        })
}

export const addDataToResource = async (userId: number, resourceId: number, data: object)=>{
    axios.post(`${ENHANCER_HOST}/user/${userId}/resource/${resourceId}/data`, data)
        .then(({data})=>{
            console.log("add data to resource", data)
        })
}

export const getAllDataFromResource = async (userId: number, resourceId: number): Promise<any> =>{
    return await axios.get(`${ENHANCER_HOST}/user/${userId}/resource/${resourceId}/data`)
        .then(({data})=>{
            console.log("get all data from resource", data)
            if(data.code === RESULT.OK)
                return data.data
            else return {}
        })
}

export const getDataFromResource = async (userId: number, resourceId: number, dataName: string): Promise<any>=>{
    return await axios.get(`${ENHANCER_HOST}/user/${userId}/resource/${resourceId}/data/${dataName}`)
        .then(({data})=>{
            if(data.code === RESULT.OK)
                return data.data
            else return {}
        })
}

export const getDataFromResourceByUrl = async (url: string)=>{
    return await axios.get(url)
        .then(({data})=>{
            // console.log("get data from resource by url", data)
            if(data.code === RESULT.OK)
                return data.data
        })
}

export const removeResourceFromUser = async (userId:number, resourceId: number): Promise<any>=>{
    return await axios.delete(`${ENHANCER_HOST}/user/${userId}/resource/${resourceId}`)
        .then(({data})=>{
            // console.log("remove resource from user", data)
            return data.code === RESULT.OK;

        })
}