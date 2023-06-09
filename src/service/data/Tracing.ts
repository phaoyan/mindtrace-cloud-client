

export interface StudyTrace{
    id: number,
    userId: number,
    title: string,
    startTime: string,
    endTime: string,
    pauseList: string[],
    continueList: string[],
    seconds: number
}

export interface TraceCoverage{
    id: number,
    traceId: number,
    knodeId: number
}

export interface CurrentStudy{
    trace: StudyTrace,
    coverages: TraceCoverage[]
}