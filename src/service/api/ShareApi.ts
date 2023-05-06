import axios from "axios";
import {BACK_HOST} from "../../constants";
import {EnhancerShare} from "../data/share/EnhancerShare";
import {Enhancer} from "../data/Enhancer";
import {UserShare} from "../data/share/UserShare";

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

export const getKnodeShare = async (knodeId: number)=>{
    return await axios.get(`${SHARE_HOST}/knode/${knodeId}`)
}
export const getOwnedEnhancerShare = async (knodeId: number): Promise<EnhancerShare[]>=>{
    return await axios.get(`${SHARE_HOST}/knode/${knodeId}/enhancer`).then(({data})=>data)
}

export const getRelatedKnodeShare = async (knodeId: number, count: number)=>{
    return await axios.get(`${SHARE_HOST}/knode/${knodeId}/similar?count=${count}`).then(({data})=>data)
}

export const getRelatedEnhancerShare = async (knodeId: number, knodeCount: number, withMapping: boolean)=>{
    return await axios.get(`${SHARE_HOST}/knode/${knodeId}/similar/enhancer?knodeCount=${knodeCount}&withMapping=${withMapping}`).then(({data})=>data)
}

export const updateKnodeShare = async (knodeId: number, data: object)=>{
    return await axios.post(`${SHARE_HOST}/knode/${knodeId}`, data)
}

export const forkEnhancerShare = async (shareId: number, targetId: number): Promise<Enhancer>=>{
    return await axios.post(`${SHARE_HOST}/enhancerShare/${shareId}/to/${targetId}`).then(({data})=>data)
}