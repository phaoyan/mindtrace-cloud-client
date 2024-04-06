import {BACK_HOST} from "../utils/constants";
import axios from "axios";
import {CurrentStudy, StudyTrace} from "../data/Tracing";
import {Resource} from "../../components/Main/InfoRight/EnhancerPanel/EnhancerCard/EnhancerCardHooks";
import {
    Milestone
} from "../../components/Main/InfoRight/RecordPanel/HistoryStudyRecord/MilestonePanel/MilestonePanelHooks";

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

export const getStudyTracesOfKnodeBySlice = async (knodeId: number, moment: string, count: number):Promise<StudyTrace[]>=>{
    return await axios.get(`${TRACING_HOST}/slice/study/knode/${knodeId}/trace?moment=${moment}&count=${count}`).then(({data})=>data)
}

export const getStudyTracesOfKnodeByPage = async (knodeId: number, page: number, size: number):Promise<StudyTrace[]>=>{
    return await axios.get(`${TRACING_HOST}/page/study/knode/${knodeId}/trace?page=${page}&size=${size}`).then(({data})=>data)
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

export const getTraceKnodeRels = async (traceId: number): Promise<number[]>=>{
    return await axios.get(`${TRACING_HOST}/study/trace/${traceId}/knode`).then(({data})=>data)
}

export const getTraceEnhancerRels = async (traceId: number): Promise<number[]>=>{
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

export const getMilestoneById = async (milestoneId: number): Promise<Milestone>=>{
    return axios.get(`${TRACING_HOST}/milestone/${milestoneId}`).then(({data})=>data)
}

export const getResourcesFromMilestone = async (milestoneId: number): Promise<Resource[]>=>{
    return axios.get(`${TRACING_HOST}/milestone/${milestoneId}/resource`).then(({data})=>data)
}

export const getMilestoneByResourceId = async (resourceId: number)=>{
    return axios.get(`${TRACING_HOST}/rel/resource/milestone?resourceId=${resourceId}`).then(({data})=>data)
}

export const getMilestonesBeneathKnode = async (knodeId: number)=>{
    return axios.get(`${TRACING_HOST}/milestone?knodeId=${knodeId}`).then(({data})=>data)
}

export const addMilestoneTraceRel = async (milestoneId: number, traceId: number)=>{
    await axios.put(`${TRACING_HOST}/rel/milestone/trace?milestoneId=${milestoneId}&traceId=${traceId}`)
}

export const removeMilestoneTraceRel = async (milestoneId: number, traceId: number)=>{
    await axios.delete(`${TRACING_HOST}/rel/milestone/trace?milestoneId=${milestoneId}&traceId=${traceId}`)
}

export const getStudyTracesInMilestone = async (milestoneId: number): Promise<StudyTrace[]>=>{
    return await axios.get(`${TRACING_HOST}/rel/milestone/trace?milestoneId=${milestoneId}`).then(({data})=>data)
}
export const setMilestoneTime = async (milestoneId: number, timeString: string)=>{
    await axios.post(`${TRACING_HOST}/milestone/${milestoneId}/time?dateTime=${timeString}`)
}

export const copyMilestoneAsEnhancerToKnode = async (milestoneId: number, knodeId: number) =>{
    await axios.post(`${TRACING_HOST}/milestone/copy?milestoneId=${milestoneId}&knodeId=${knodeId}`)
}

export const getCurrentMonthStudyTime = async (knodeId: number):Promise<number>=>{
    return await axios.get(`${TRACING_HOST}/study/knode/${knodeId}/info/current-month-study-time`).then(({data})=>data)
}

export const getStudyTimeAccumulation = async (knodeId: number)=>{
    return await axios.get(`${TRACING_HOST}/study/knode/${knodeId}/info/study-time-accumulation`).then(({data})=>data)
}

export const getStudyTraceCount = async (knodeId: number): Promise<number>=>{
    return await axios.get(`${TRACING_HOST}/study/knode/${knodeId}/info/trace-count`).then(({data})=>data)
}


export const getTraceCount = async (knodeId: number)=>{
    return await axios.get(`${TRACING_HOST}/study/knode/${knodeId}/info/trace-count`).then(({data})=>data)
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