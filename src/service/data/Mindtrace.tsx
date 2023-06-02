import dayjs from "dayjs";
import {DEFAULT_DATE_TIME_PATTERN} from "../../constants";

/**
 * Mindtrace是针对Knode而言的，但是一次学习可能会覆盖多个Knode，
 * 所以需要一个LearningTrace来装填学习信息，
 * 在结算学习的时候，LearningTrace会被拆解成多个MindTrace存入后端
 */
export interface LearningTrace{
    id: number,
    enhancerId: number,
    createBy: number,
    createTime: string,
    remark?: string,
    pauseList: string[],
    continueList: string[]

}

export interface WrappedLearningTrace{
    id: number,
    enhancerInfo:{
        id: number,
        title: string
    },
    knodeInfo:{
        id: number,
        title: string
    }[],
    duration: number,
    createTime: string

}

export interface Mindtrace{
    id: number,
    enhancerId: number,
    knodeId: number,
    createBy: number,
    retentionAfter: number,
    retentionBefore: number,
    reviewLayer: number,
    createTime: string,
    remark?: string
}

export const defaultMindtrace: Mindtrace = {
    id: -1,
    enhancerId: -1,
    knodeId: -1,
    createBy: -1,
    retentionAfter: 0,
    retentionBefore: 0,
    reviewLayer: 0,
    createTime: "2000-01-01T00:00:00",
    remark: ""
}

export const  calculateDuration = (learningTrace: LearningTrace)=>{
    if(!learningTrace) return 0

    let duration = 0
    let left = [learningTrace.createTime, ...learningTrace.continueList]
    let right = [...learningTrace.pauseList, dayjs().format(DEFAULT_DATE_TIME_PATTERN)]
    for(let i in left)
        duration += dayjs(right[i]).diff(dayjs(left[i]))
    return duration
}


export const masteryDesc = (value: number | undefined) =>{
    if(!value) return "初识"
    return  value === 0 ? "完全没懂" :
            value <= 0.25 ? "懵懵懂懂" :
            value <= 0.5 ? "大致明白" :
            value <= 0.75 ? "基本理解" :
            value <= 1 ? "完全理解" : ""
}