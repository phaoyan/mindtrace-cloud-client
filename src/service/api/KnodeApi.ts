import axios from "axios";
import {BACK_HOST} from "../utils/constants";
import {Knode} from "../data/Knode";


export const KNODE_HOST = `${BACK_HOST}/core`

export const getKnodeById = async (knodeId: number): Promise<Knode>=>{
    return await axios.get(`${KNODE_HOST}/knode/${knodeId}`).then(({data})=>data)
}

export const getKnodeByLike = async (like: string, count: number)=>{
    return await axios.get(`${KNODE_HOST}/like/knode?like=${like}&count=${count}`).then(({data})=>data)
}

export const getKnodes = async (userId: number)=>{
    return await axios.get(`${KNODE_HOST}/user/${userId}/knode`).then(({data})=>data)
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

export const shiftKnode = async (stemId: number , branchIds: number[])=>{
    return await axios.post(
        `${KNODE_HOST}/knode/shift?stemId=${stemId}`,
        branchIds,
        {headers:{"Content-Type":"application/json"}})
        .then(({data})=>data)
}

export const swapBranchIndex = async (stemId: number, index1: number, index2: number)=>{
    return await axios.post(`${KNODE_HOST}/knode/${stemId}/branch/index/${index1}/${index2}`)
}

export const getChainStyleTitle = async (knodeId: number): Promise<string[]>=>{
    return await
        axios.get(`${KNODE_HOST}/knode/${knodeId}/chainStyleTitle`)
            .then(({data})=>{
                return data
            })
}

export const getAncestors = async (knodeId: number):Promise <Knode[]>=>{
    return await axios.get(`${KNODE_HOST}/knode/${knodeId}/ancestor`).then(({data})=>data)
}

export const getLeaves = async (knodeId: number): Promise<Knode[]>=>{
    return await axios.get(`${KNODE_HOST}/knode/${knodeId}/leaves`).then(({data})=>data)
}

export const getLeaveCount = async (knodeId: number): Promise<number>=>{
    return await axios.get(`${KNODE_HOST}/knode/${knodeId}/leave/count`).then(({data})=>data)
}

export const connectKnode = async (knodeId1: number, knodeId2: number)=>{
    await axios.post(`${KNODE_HOST}/knode/connection?knodeId1=${knodeId1}&knodeId2=${knodeId2}`)
}

export const disconnectKnode = async (knodeId1: number, knodeId2: number)=>{
    await axios.delete(`${KNODE_HOST}/knode/connection?knodeId1=${knodeId1}&knodeId2=${knodeId2}`)
}