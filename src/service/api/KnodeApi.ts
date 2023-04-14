import axios from "axios";
import {BACK_HOST, RESULT} from "../../constants";
import {Knode} from "../data/Knode";


export const KNODE_HOST = `${BACK_HOST}/core`

export const getKnodes = async (userId: number)=>{
    return await
        axios.get(`${KNODE_HOST}/user/${userId}/knode`)
        .then(({data})=>{
            console.log("GET KNODES", data)
            if(data.code===RESULT.OK)
                return data.data
            else return []
        })
}

export const branch = async (userId: number, knodeId: number)=>{
    return await
        axios.post(`${KNODE_HOST}/user/${userId}/knode/${knodeId}/branch?title=`)
        .then(({data})=>data.data)
}

export const removeKnode = async (userId: number, knodeId: number)=>{
    return await
        axios.delete(`${KNODE_HOST}/user/${userId}/knode/${knodeId}`)
        .then(({data})=>data.data)
}
export const updateKnode = async (updated: Knode, userId:number)=>{
    return await axios.post(`${KNODE_HOST}/user/${userId}/knode/${updated.id}`, {title: updated.title})
}

export const getChainStyleTitle = async (userId: number, knodeId: number)=>{
    return await
        axios.get(`${KNODE_HOST}/user/${userId}/knode/${knodeId}/chainStyleTitle`)
            .then(({data})=>{
                // console.log("get chain style title", data)
                if(data.code === RESULT.OK)
                    return data.data
                return ""
            })
}

export const shiftKnode = async (userId: number, stemId: number , branchId: number)=>{
    return await
        axios.post(`${KNODE_HOST}/user/${userId}/knode/${stemId}/branch/${branchId}`)
            .then(({data})=>{
                console.log("shift knode", data)
                if(data.code === RESULT.OK)
                    return data.data
            })
}

export const swapBranchIndex = async (userId: number, stemId: number, index1: number, index2: number)=>{
    return await
        axios.post(`${KNODE_HOST}/user/${userId}/knode/${stemId}/branch/index/${index1}/${index2}`).then(({data})=>data)
}