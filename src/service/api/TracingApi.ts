import axios from "axios";
import {BACK_HOST, DEFAULT_DATE_TIME_PATTERN} from "../../constants";
import dayjs from "dayjs";
import {defaultMindtrace, LearningTrace, Mindtrace} from "../data/Mindtrace";

export const TRACING_HOST = `${BACK_HOST}/tracing`

export const checkNow = async (userId: number) => {
    return await axios.get(`${TRACING_HOST}/user/${userId}/learn/now`)
        .then(({data})=>{
            // console.log("check learn now", data)
            return data
        })
}

export const checkLatest = async (userId: number) => {
    return await axios.get(`${TRACING_HOST}/user/${userId}/learn/latest`)
        .then(({data})=>{
            // console.log("check learn latest", data)
            return data
        })
}

export const checkAll = async (userId: number) => {
    return await axios.get(`${TRACING_HOST}/user/${userId}/learn`)
        .then(({data})=>{
            // console.log("check learn all", data)
            return data
        })
}

export const removeLearningTraceById = async (userId: number, traceId: number)=>{
    return await axios.delete(`${TRACING_HOST}/user/${userId}/learn/trace/${traceId}`)
        .then(({data})=>{
            console.log("remove learning TraceInfo", data)
        })
}

export const startLearning = async (userId: number, enhancerId: number)=>{
    return await axios.post(`${TRACING_HOST}/user/${userId}/learn`, {
        type:"start learning",
        data:{
            enhancerId: enhancerId
        }
    }).then(({data})=>{
        console.log("start learning", data)
        return data
    })
}

export const finishLearning = async (userId: number, traceId: number)=>{
    return await axios.post(`${TRACING_HOST}/user/${userId}/learn`, {
        type:"finish learning",
        data:{
            id: traceId
        }
    }).then(({data})=>{
        console.log("finish learning", data)
    })
}

export const pauseLearning = async (userId: number, traceId: number)=>{
    console.log("pause",traceId)
    return await axios.post(`${TRACING_HOST}/user/${userId}/learn`, {
        type:"pause learning",
        data:{
            id: traceId,
            pause: dayjs().format(DEFAULT_DATE_TIME_PATTERN)
        }
    }).then(({data})=>{
        console.log("pause learning", data)
        return data
    })
}

export const continueLearning = async (userId: number, traceId: number)=>{
    return await axios.post(`${TRACING_HOST}/user/${userId}/learn`, {
        type:"continue learning",
        data:{
            id: traceId,
            continue: dayjs().format(DEFAULT_DATE_TIME_PATTERN)
        }
    }).then(({data})=>{
        console.log("continue learning", data)
        return data
    })
}

// 将LearningTrace结算为MindTrace数据
export const settleLearning = async (userId: number, traceId:number, mindtraces: Mindtrace[])=>{
    return await axios.post(`${TRACING_HOST}/user/${userId}/learn`, {
        type:"settle learning",
        data:{
            id: traceId,
        },
        dtos: mindtraces
    }).then(({data})=>{
        // console.log("settle learning", data)
        return data
    })
}

export const dropLearning = async (userId: number, traceId: number)=>{
    return await axios.post(`${TRACING_HOST}/user/${userId}/learn`, {
        type:"drop learning",
        data:{
            id: traceId
        }
    }).then(({data})=>{
        // console.log("drop learning", data)
    })
}


export const getKnodeRelatedLearningTrace = async (userId: number, knodeId: number): Promise<LearningTrace[]>=>{
    return await axios.get(`${TRACING_HOST}/user/${userId}/learn/knode/${knodeId}`)
        .then(({data})=>{
            // console.log("get knode related learning TraceInfo", data)
            return data
        })
}

export const getRelatedKnodeIdsOfLearningTrace = async (userId: number, traceId: number): Promise<number[]>=>{
    return await axios.get(`${TRACING_HOST}/user/${userId}/learn/trace/${traceId}/knode`)
        .then(({data})=>{
            // console.log("get related knode ids of learning TraceInfo", data)
            return data
        })
}

export const getMindtracesByKnodeId = async (userId: number, knodeId: number): Promise<Mindtrace[]>=>{
    return await axios.get(`${TRACING_HOST}/user/${userId}/mind/knode/${knodeId}/trace`)
        .then(({data})=>{
            // console.log("get mindtraces by knode id", data)
            if(data.code)
                return [defaultMindtrace]
            return data
        })
}

export const getTraceCache = async (userId: number, key: string): Promise<any>=>{
    return await axios.get(`${TRACING_HOST}/user/${userId}/cache?key=${key}`).then(({data})=>data)
}

export const updateTraceCache = async (userId: number, data: any)=>{
    return await axios.post(`${TRACING_HOST}/user/${userId}/cache`, data).then(({data})=>data)
}