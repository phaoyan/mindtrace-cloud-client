import {atom, useRecoilState, useRecoilValue} from "recoil";
import {examInteractWrapped} from "../../../../../../service/api/MasteryApi";
import {
    CurrentExamSessionAtom,
    ExamCurrentQuizzesAtom
} from "../../../../../../recoil/home/ExamSession";

export interface ResponseData{
    type: string,
    layerId: number,
    knodeId: number,
    quizIds: number[]
}

export interface StatisticsData{
    corrects: string[] //回答正确的knode id
    mistakes: string[] //回答错误的knode id
    currentCorrects: string[] //当前层回答正确的knode id
    currentMistakes: string[] //当前层回答错误的knode id
    layerId: number // 当前层knode id,
    mistakeMap: any
}

export const HotspotMainMsgAtom = atom<ResponseData>({
    key: "HotspotMainMsgAtom",
    default: undefined
})

export const HotspotStatisticsMsgAtom = atom<StatisticsData>({
    key: "HotspotStatisticsMsgAtom",
    default: undefined
})

export const useHandleRight = ()=>{
    const currentSession = useRecoilValue(CurrentExamSessionAtom)
    const [mainMsg, setMainMsg] = useRecoilState(HotspotMainMsgAtom)
    const [, setStatisticsMsg] = useRecoilState(HotspotStatisticsMsgAtom)
    const [currentQuiz,] = useRecoilState(ExamCurrentQuizzesAtom)
    return async ()=>{
        if(!currentSession) return
        const req = {
            type:"main",
            layerId: mainMsg.layerId,
            knodeId: mainMsg.knodeId,
            quizIds: currentQuiz.map(quiz=>quiz.id),
            completion: true
        }
        const mainResp = await examInteractWrapped(currentSession.id, req);
        setMainMsg(JSON.parse(mainResp.message!))
            const statisticsResp = await examInteractWrapped(currentSession.id, {type:"statistics"})
            setStatisticsMsg(JSON.parse(statisticsResp.message!))
    }
}

export const useHandleWrong = ()=>{
    const currentSession = useRecoilValue(CurrentExamSessionAtom)
    const [mainMsg, setMainMsg] = useRecoilState(HotspotMainMsgAtom)
    const [, setStatisticsMsg] = useRecoilState(HotspotStatisticsMsgAtom)
    const [currentQuiz,] = useRecoilState(ExamCurrentQuizzesAtom)
    return async ()=>{
        if(!currentSession) return
        const req = {
            type: "main",
            layerId: mainMsg.layerId,
            knodeId:mainMsg.knodeId,
            quizIds: currentQuiz.map(quiz=>quiz.id),
            completion: false
        }
        const mainResp = await examInteractWrapped(currentSession.id, req);
        setMainMsg(JSON.parse(mainResp.message!))
        const statisticsResp = await examInteractWrapped(currentSession.id, {type:"statistics"})
        setStatisticsMsg(JSON.parse(statisticsResp.message!))
    }
}