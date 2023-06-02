import {ExamInteract} from "./ExamInteract";

export interface ExamResult{
    id: number,
    rootId: number,
    userId: number,
    startTime: string,
    endTime: string,
    interacts: ExamInteract[],
    examStrategy: string
}