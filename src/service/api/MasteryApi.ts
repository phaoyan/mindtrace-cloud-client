import {BACK_HOST} from "../utils/constants";
import axios from "axios";
import {ExamStrategy} from "../data/mastery/ExamStrategy";
import {ExamSession} from "../data/mastery/ExamSession";
import {ExamInteract, examInteractPrototype} from "../data/mastery/ExamInteract";
import {ExamAnalysis} from "../data/mastery/ExamAnalysis";

export const MASTERY_HOST = `${BACK_HOST}/mastery`

export const startExamSession = async (rootId: number, strategy: ExamStrategy): Promise<ExamSession>=>{
    return await axios.post(`${MASTERY_HOST}/session`,
        {rootId: rootId, examStrategy: JSON.stringify(strategy)})
        .then(({data})=>data)
}

export const getCurrentExamSession = async (): Promise<ExamSession[]>=>{
    return await axios.get(`${MASTERY_HOST}/session?userId=`).then(({data})=>data)
}

export const finishExamSession = async (sessionId: number)=>{
    return await axios.post(`${MASTERY_HOST}/session/${sessionId}/finish`).then(({data})=>data)
}

export const interruptExamSession = async (sessionId: number)=>{
    await axios.delete(`${MASTERY_HOST}/session/${sessionId}`)
}

export const examInteract = async (sessionId: number, data: ExamInteract): Promise<ExamInteract>=>{
    return await axios.post(`${MASTERY_HOST}/session/${sessionId}`, data).then(({data})=>data)
}

export const examInteractWrapped = async (sessionId: number, message: object): Promise<ExamInteract>=>{
    return await examInteract(sessionId, examInteractPrototype(sessionId, message))
}

export const getExamAnalysisOfKnodeOffsprings = async (knodeId: number, analyzerName: string)=>{
    return await axios.get(`${MASTERY_HOST}/knode/${knodeId}/offsprings/exam/analysis?analyzerName=${analyzerName}`).then(({data})=>data)
}

export const getExamResultsOfKnodeOffsprings = async (knodeId: number)=>{
    return await axios.get(`${MASTERY_HOST}/knode/${knodeId}/offsprings/exam/result`).then(({data})=>data)
}

export const getExamAnalysis = async (resultId: number, analyzerName: string): Promise<ExamAnalysis>=>{
    return await axios.get(`${MASTERY_HOST}/exam/analysis/${resultId}?analyzerName=${analyzerName}`).then(({data})=>data)
}

export const removeExamResult = async (resultId: number)=>{
    await axios.delete(`${MASTERY_HOST}/exam/result/${resultId}`)
}