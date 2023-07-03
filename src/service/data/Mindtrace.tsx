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