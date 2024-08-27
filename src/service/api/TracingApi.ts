import {BACK_HOST} from "../utils/constants";
import axios from "axios";
import {CurrentStudy, StudyTrace, TraceGroup} from "../data/Tracing";
export const TRACING_HOST = `${BACK_HOST}/tracing`

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

export const restartCurrentStudy = async (traceId: number): Promise<CurrentStudy>=>{
    return await axios.post(`${TRACING_HOST}/study/current?traceId=${traceId}`).then(({data})=>data)
}

export const updateDurationOffset = async (offset: number): Promise<CurrentStudy>=>{
    return await axios.post(`${TRACING_HOST}/study/current/duration-offset?offset=${offset}`).then(({data})=>data)
}

export const updateStartTime = async (startTime: string): Promise<CurrentStudy>=>{
    return await axios.post(`${TRACING_HOST}/study/current/start?startTime=${startTime}`).then(({data})=>data)
}

export const removeCurrentStudy = async ()=>{
    await axios.delete(`${TRACING_HOST}/study/current`)
}
export const addTraceEnhancerRelCurrent = async (enhancerId: number): Promise<number[]>=>{
    return await axios.post(`${TRACING_HOST}/study/current/enhancer/${enhancerId}`).then(({data})=>data)
}

export const addTraceEnhancerRel = async (traceId: number, enhancerId: number)=>{
    await axios.put(`${TRACING_HOST}/rel/trace/enhancer?traceId=${traceId}&enhancerId=${enhancerId}`)
}

export const removeTraceEnhancerRelCurrent = async (enhancerId: number) =>{
    await axios.delete(`${TRACING_HOST}/study/current/enhancer/${enhancerId}`)
}

export const removeTraceEnhancerRel = async (traceId: number, enhancerId: number)=>{
    await axios.delete(`${TRACING_HOST}/rel/trace/enhancer?traceId=${traceId}&enhancerId=${enhancerId}`)
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

export const getKnodeIdsByTraceId = async (traceId: number): Promise<number[]>=>{
    return await axios.get(`${TRACING_HOST}/study/trace/${traceId}/knode`).then(({data})=>data)
}

export const getEnhancerIdsByTraceId = async (traceId: number): Promise<number[]>=>{
    return await axios.get(`${TRACING_HOST}/study/trace/${traceId}/enhancer`).then(({data})=>data)
}

export const getStudyTraceKnodeInfo = async (knodeId: number): Promise<any[]>=>{
    return await axios.get(`${TRACING_HOST}/study/knode/${knodeId}`).then(({data})=>data)
}

export const getStudyTraceEnhancerInfo = async (enhancerId: number): Promise<any[]>=>{
    return await axios.get(`${TRACING_HOST}/study/enhancer/${enhancerId}`).then(({data})=>data)
}

export const getStudyTraceEnhancerInfoUnderKnode = async (knodeId: number): Promise<any[]> => {
    return await axios.get(`${TRACING_HOST}/study/knode/${knodeId}/enhancer`).then(({data})=>data)
}

export const getCurrentMonthStudyTime = async (knodeId: number):Promise<number>=>{
    return await axios.get(`${TRACING_HOST}/study/knode/${knodeId}/info/current-month-study-time`).then(({data})=>data)
}

export const getStudyTimeAccumulation = async (knodeId: number)=>{
    return await axios.get(`${TRACING_HOST}/study/knode/${knodeId}/info/study-time-accumulation`).then(({data})=>data)
}

export const getCalendarDay = async (knodeId: number)=>{
    return await axios.get(`${TRACING_HOST}/study/knode/${knodeId}/info/calendar-day`).then(({data})=>data)
}

export const getCalendarMonth = async (knodeId: number)=>{
    return await axios.get(`${TRACING_HOST}/study/knode/${knodeId}/info/calendar-month`).then(({data})=>data)
}

export const getStudyTraceEnhancerGroupInfo = async (groupId: number)=>{
    return await axios.get(`${TRACING_HOST}/study/enhancer-group/${groupId}`).then(({data})=>data)
}

export const getGroupMappingByTraceIds = async (traceIds: number[]): Promise<{[key: number]:number}>=>{
    return await axios.post(`${TRACING_HOST}/trace-group/mapping`, traceIds).then(({data})=>data)
}

export const getGroupByIdBatch = async (groupIds: number[]): Promise<TraceGroup[]>=>{
    return await axios.post(`${TRACING_HOST}/trace-group`, groupIds).then(({data})=>data)
}

export const unionTraces = async (traceIds: number[]): Promise<TraceGroup>=>{
    return await axios.put(`${TRACING_HOST}/trace-group?traceIds=${traceIds}`).then(({data})=>data)
}

export const unionTracesToGroup = async (traceIds: number[], groupId: number)=>{
    return await axios.put(`${TRACING_HOST}/trace-group?traceIds=${traceIds}&groupId=${groupId}`).then(({data})=>data)
}

export const setTraceGroupTitle = async (groupId: number, title: string)=>{
    await axios.put(`${TRACING_HOST}/trace-group/${groupId}/title?title=${title}`)
}

export const removeTraceGroup = async (groupId: number)=>{
    await axios.delete(`${TRACING_HOST}/trace-group/${groupId}`)
}

export const removeTraceGroupRel = async (traceId: number, groupId: number)=>{
    await axios.delete(`${TRACING_HOST}/trace/${traceId}/trace-group/${groupId}`)
}