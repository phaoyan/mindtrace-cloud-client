
export interface Mindtrace{
    id: number,
    enhancerId: number,
    knodeId: number,
    createBy: number,
    retentionAfter: number,
    retentionBefore: number,
    reviewLayer: number,
    createTime: string,
    duration: number //second
    remark?: string

}

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
    remark?: string

}