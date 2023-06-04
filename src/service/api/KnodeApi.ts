import axios from "axios";
import {BACK_HOST} from "../../constants";
import {Knode} from "../data/Knode";


export const KNODE_HOST = `${BACK_HOST}/core`

export const getKnodeById = async (knodeId: number): Promise<Knode>=>{
    return await axios.get(`${KNODE_HOST}/knode/${knodeId}`).then(({data})=>data)
}

export const getKnodes = async (userId: number)=>{
    return await
        axios.get(`${KNODE_HOST}/user/${userId}/knode`)
        .then(({data})=>{
            console.log("GET KNODES", data)
            return data
        })
}

export const branch = async (knodeId: number): Promise<Knode>=>{
    return await axios.post(`${KNODE_HOST}/knode/${knodeId}/branch?title=`).then(({data})=>data)
}

export const removeKnode = async (knodeId: number)=>{
    return await
        axios.delete(`${KNODE_HOST}/knode/${knodeId}`)
        .then(({data})=>data)
}
export const updateKnode = async (updated: Knode)=>{
    return await axios.post(`${KNODE_HOST}/knode/${updated.id}`, {title: updated.title})
}

export const shiftKnode = async (stemId: number , branchId: number)=>{
    return await
        axios.post(`${KNODE_HOST}/knode/${stemId}/branch/${branchId}`)
            .then(({data})=>{
                console.log("shift knode", data)
                return data
            })
}

export const swapBranchIndex = async (stemId: number, index1: number, index2: number)=>{
    return await
        axios.post(`${KNODE_HOST}/knode/${stemId}/branch/index/${index1}/${index2}`)
}

export const getChainStyleTitle = async (knodeId: number): Promise<string[]>=>{
    return await
        axios.get(`${KNODE_HOST}/knode/${knodeId}/chainStyleTitle`)
            .then(({data})=>{
                // console.log("get chain style title", data)
                return data
            })
}

export const getLeaves = async (knodeId: number)=>{
    return await
        axios.get(`${KNODE_HOST}/knode/${knodeId}/leaves`)
            .then(({data})=>{
                console.log("get leaves", data)
                if(data.code)
                    return []
                return data
            })
}