import {SetStateAction} from "react";
import {Enhancer} from "./Enhancer";
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

export const  calculateDuration = (learningTrace: LearningTrace)=>{
    if(!learningTrace) return 0

    let duration = 0
    let left = [learningTrace.createTime, ...learningTrace.continueList]
    let right = [...learningTrace.pauseList, dayjs().format(DEFAULT_DATE_TIME_PATTERN)]
    for(let i in left)
        duration += dayjs(right[i]).diff(dayjs(left[i]))
    return duration
}