import axios from "axios";
import {ENHANCER_HOST} from "./EnhancerApi";
import {RESULT} from "../../constants";
import {Resource} from "../data/Resource";


export const putResource = async (userId: number, enhancerId: number)=>{

}

export const getResourcesFromEnhancer = async (userId: number, enhancerId: number): Promise<Resource[]> =>{
    return await axios.get(`${ENHANCER_HOST}/user/${userId}/enhancer/${enhancerId}/resource`)
        .then(({data})=>{
            console.log("GET RESOURCE FROM ENHANCER", data)
            if(data.code === RESULT.OK)
                return data.data
            else return []
        })
}