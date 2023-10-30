import {BACK_HOST} from "../utils/constants";
import axios from "axios";
import {CurrentStudy, StudyTrace} from "../data/Tracing";

export const TRACING_HOST = `${BACK_HOST}/tracing`

export const getStudyTraces = async ():Promise<StudyTrace[]>=>{
    return await axios.get(`${TRACING_HOST}/study/trace`).then(({data})=>data)
}

export const updateStudyTrace = async (trace: { id: number; title: string })=>{
    await axios.post(`${TRACING_HOST}/study/trace`, trace)
}

export const getStudyTracesOfKnode = async (knodeId: number):Promise<StudyTrace[]>=>{
    return await axios.get(`${TRACING_HOST}/study/knode/${knodeId}/trace`).then(({data})=>data)
}

export const removeStudyTrace = async (traceId: number)=>{
    return await axios.delete(`${TRACING_HOST}/study/trace/${traceId}`)
}

export const getCurrentStudy = async ()=>{
    return await axios.get(`${TRACING_HOST}/study/current`).then(({data})=>data)
}

export const startCurrentStudy = async (): Promise<CurrentStudy>=>{
    return await axios.post(`${TRACING_HOST}/study/current`).then(({data})=>data)
}

export const updateStartTime = async (startTime: string): Promise<CurrentStudy>=>{
    return await axios.post(`${TRACING_HOST}/study/current/start?startTime=${startTime}`).then(({data})=>data)
}

export const updateEndTime = async (endTime: string): Promise<CurrentStudy>=>{
    return await axios.post(`${TRACING_HOST}/study/current/end?endTime=${endTime}`).then(({data})=>data)
}

export const removeCurrentStudy = async ()=>{
    await axios.delete(`${TRACING_HOST}/study/current`)
}

export const addTraceKnodeRel = async (knodeId: number): Promise<number[]>=>{
    return await axios.post(`${TRACING_HOST}/study/current/knode/${knodeId}`).then(({data})=>data)
}

export const removeTraceKnodeRel = async (knodeId: number) =>{
    await axios.delete(`${TRACING_HOST}/study/current/knode/${knodeId}`)
}

export const addTraceEnhancerRel = async (enhancerId: number): Promise<number[]>=>{
    return await axios.post(`${TRACING_HOST}/study/current/enhancer/${enhancerId}`).then(({data})=>data)
}

export const removeTraceEnhancerRel = async (enhancerId: number) =>{
    await axios.delete(`${TRACING_HOST}/study/current/enhancer/${enhancerId}`)
}


export const settleCurrentStudy = async (): Promise<StudyTrace>=>{
    return await axios.post(`${TRACING_HOST}/study/current/settle`).then(({data})=>data)
}

export const pauseCurrentStudy = async (): Promise<CurrentStudy>=>{
    return await axios.post(`${TRACING_HOST}/study/current/pause`).then(({data})=>data)
}

export const continueCurrentStudy = async (): Promise<CurrentStudy>=>{
    return await axios.post(`${TRACING_HOST}/study/current/continue`).then(({data})=>data)
}

export const editCurrentStudyTitle = async (title: string): Promise<CurrentStudy>=>{
    return await axios.post(`${TRACING_HOST}/study/current/title?title=${title}`).then(({data})=>data)
}

export const getTraceKnodeRels = async (traceId: number): Promise<number[]>=>{
    return await axios.get(`${TRACING_HOST}/study/trace/${traceId}/knode`).then(({data})=>data)
}

export const getTraceEnhancerRels = async (traceId: number): Promise<number[]>=>{
    return await axios.get(`${TRACING_HOST}/study/trace/${traceId}/enhancer`).then(({data})=>data)
}

export const getStudyTraceKnodeInfo = async (knodeId: number): Promise<any[]>=>{
    return await axios.get(`${TRACING_HOST}/study/knode/${knodeId}`).then(({data})=>data)
}

export const getStudyTraceEnhancerInfoUnderKnode = async (knodeId: number): Promise<any[]> => {
    return await axios.get(`${TRACING_HOST}/study/knode/${knodeId}/enhancer`).then(({data})=>data)
}

export const getEnhancerTraceTimeline = async (knodeId: number, minDuration: number, minInterval: number): Promise<any> =>{
    return await axios.get(`${TRACING_HOST}/study/knode/${knodeId}/timeline/enhancer?minDuration=${minDuration}&minInterval=${minInterval}`).then(({data})=>data)
}

export const addMilestone = async (knodeId: number)=>{
    return await axios.put(`${TRACING_HOST}/milestone?knodeId=${knodeId}`).then(({data})=>data)
}

export const removeMilestone = async (id: number)=>{
    await axios.delete(`${TRACING_HOST}/milestone/${id}`)
}

export const setMilestoneKnodeId = async (milestoneId: number, knodeId: number)=>{
    await axios.post(`${TRACING_HOST}/milestone/${milestoneId}/knode?knodeId=${knodeId}`)
}

export const setMilestoneDescription = async (milestoneId: number, description: string)=>{
    await axios.post(`${TRACING_HOST}/milestone/${milestoneId}/description`, description,{headers:{"Content-Type":"text/plain"}})
}

export const addResourceToMilestone = async (milestoneId: number, type: string)=>{
    return axios.put(`${TRACING_HOST}/milestone/${milestoneId}/resource?type=${type}`).then(({data})=>data)
}

export const removeResourceFromMilestone = async (resourceId: number)=>{
    await axios.delete(`${TRACING_HOST}/milestone/resource/${resourceId}`)
}

export const getMilestoneById = async (milestoneId: number)=>{
    return axios.get(`${TRACING_HOST}/milestone/${milestoneId}`).then(({data})=>data)
}

export const getResourcesFromMilestone = async (milestoneId: number)=>{
    return axios.get(`${TRACING_HOST}/milestone/${milestoneId}/resource`).then(({data})=>data)
}

export const getMilestonesBeneathKnode = async (knodeId: number)=>{
    return axios.get(`${TRACING_HOST}/milestone?knodeId=${knodeId}`).then(({data})=>data)
}