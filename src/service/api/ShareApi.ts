import axios from "axios";
import {BACK_HOST} from "../utils/constants";
import {EnhancerShare} from "../data/share/EnhancerShare";
import {Enhancer} from "../data/Enhancer";
import {UserShare} from "../data/share/UserShare";
import {KnodeShare} from "../data/share/KnodeShare";

export const SHARE_HOST = `${BACK_HOST}/share`

export const getUserShare = async (userId: number): Promise<UserShare>=>{
    return await axios.get(`${SHARE_HOST}/user/${userId}`).then(({data})=>data)
}

export const openUserShare = async (userId: number)=>{
    return await axios.post(`${SHARE_HOST}/user/${userId}`)
}

export const closeUserShare = async (userId: number)=>{
    return await axios.delete(`${SHARE_HOST}/user/${userId}`)
}

export const getKnodeShare = async (knodeId: number): Promise<KnodeShare>=>{
    return await axios.get(`${SHARE_HOST}/knode/${knodeId}`).then(({data})=>data)
}

export const getOwnedEnhancerShare = async (knodeId: number): Promise<EnhancerShare[]>=>{
    return await axios.get(`${SHARE_HOST}/knode/${knodeId}/enhancer`).then(({data})=>data)
}

export const getRelatedKnodeShare = async (knodeId: number): Promise<KnodeShare[]>=>{
    return await axios.get(`${SHARE_HOST}/knode/${knodeId}/similar`).then(({data})=>data)
}

export const getEnhancerShare = async (enhancerId: number): Promise<EnhancerShare>=>{
    return await axios.get(`${SHARE_HOST}/enhancer/${enhancerId}`).then(({data})=>data)
}

export const updateKnodeShare = async (knodeId: number, data: object)=>{
    return await axios.post(`${SHARE_HOST}/knode/${knodeId}`, data)
}

export const forkEnhancerShare = async (shareId: number, targetId: number): Promise<Enhancer>=>{
    return await axios.post(`${SHARE_HOST}/enhancerShare/${shareId}/to/${targetId}`).then(({data})=>data)
}

export const getUserSubscribes = async (knodeId: number): Promise<number[]>=>{
    return await axios.get(`${SHARE_HOST}/knode/${knodeId}/subscribe/user`).then(({data})=>data)
}
export const getKnodeSubscribes = async (knodeId: number): Promise<number[]>=>{
    return await axios.get(`${SHARE_HOST}/knode/${knodeId}/subscribe/knode`).then(({data})=>data)
}
export const getEnhancerSubscribes = async (knodeId: number): Promise<number[]>=>{
    return await axios.get(`${SHARE_HOST}/knode/${knodeId}/subscribe/enhancer`).then(({data})=>data)
}
export const subscribeUser = async (subscriberKnodeId: number, userId: number) =>{
    await axios.post(`${SHARE_HOST}/knode/${subscriberKnodeId}/subscribe/user/${userId}`)
}
export const subscribeKnode = async (subscriberKnodeId: number, knodeId: number)=>{
    await axios.post(`${SHARE_HOST}/knode/${subscriberKnodeId}/subscribe/knode/${knodeId}`)
}
export const subscribeEnhancer = async (subscriberKnodeId: number, enhancerId: number)=>{
    await axios.post(`${SHARE_HOST}/knode/${subscriberKnodeId}/subscribe/enhancer/${enhancerId}`)
}
export const removeUserSubscribe = async (subscriberKnodeId: number, userId: number)=>{
    await axios.delete(`${SHARE_HOST}/knode/${subscriberKnodeId}/subscribe/user/${userId}`)
}
export const removeKnodeSubscribe = async (subscriberKnodeId: number, knodeId: number)=>{
    await axios.delete(`${SHARE_HOST}/knode/${subscriberKnodeId}/subscribe/knode/${knodeId}`)
}
export const removeEnhancerSubscribe = async (subscriberKnodeId: number, enhancerId: number)=>{
    await axios.delete(`${SHARE_HOST}/knode/${subscriberKnodeId}/subscribe/enhancer/${enhancerId}`)
}