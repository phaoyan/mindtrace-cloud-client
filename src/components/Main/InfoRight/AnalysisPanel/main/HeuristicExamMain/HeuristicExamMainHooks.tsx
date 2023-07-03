import {atom, useRecoilState, useRecoilValue} from "recoil";
import {CurrentExamSessionAtom, ExamCurrentQuizzesAtom} from "../../../../../../recoil/home/ExamSession";
import {examInteractWrapped} from "../../../../../../service/api/MasteryApi";

export interface HeuristicMainMsg{
    type: "main"
    layerId: number
    knodeId: number
    quizIds: number[]
}

export interface HeuristicStatisticsMsg{
    corrects: number[]
    mistakes: number[]
    currentCorrects: number[]
    currentMistakes: number[]
    layerId: number
}

export const HeuristicMainMsgAtom = atom<HeuristicMainMsg>({
    key: "HeuristicMainMsgAtom",
    default: undefined
})

export const HeuristicStatisticsMsgAtom = atom<HeuristicStatisticsMsg>({
    key: "HeuristicStatisticsMsgAtom",
    default: undefined
})


export const useHandleRight = ()=>{
    const currentSession = useRecoilValue(CurrentExamSessionAtom)
    const [mainMsg, setMainMsg] = useRecoilState(HeuristicMainMsgAtom)
    const [, setStatisticsMsg] = useRecoilState(HeuristicStatisticsMsgAtom)
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
    const [mainMsg, setMainMsg] = useRecoilState(HeuristicMainMsgAtom)
    const [, setStatisticsMsg] = useRecoilState(HeuristicStatisticsMsgAtom)
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

export const useHandleLayerUp = ()=>{
    const currentSession = useRecoilValue(CurrentExamSessionAtom)
    const [, setMainMsg] = useRecoilState(HeuristicMainMsgAtom)
    const [, setStatisticsMsg] = useRecoilState(HeuristicStatisticsMsgAtom)
    return async ()=>{
        if(!currentSession) return
        const req = {
            type: "main",
            next: "top"
        }
        const mainResp = await examInteractWrapped(currentSession.id, req);
        setMainMsg(JSON.parse(mainResp.message!))
        const statisticsResp = await examInteractWrapped(currentSession.id, {type:"statistics"})
        setStatisticsMsg(JSON.parse(statisticsResp.message!))
    }
}

export const useHandleLayerRight = ()=>{
    const currentSession = useRecoilValue(CurrentExamSessionAtom)
    const [, setMainMsg] = useRecoilState(HeuristicMainMsgAtom)
    const [, setStatisticsMsg] = useRecoilState(HeuristicStatisticsMsgAtom)
    return async ()=>{
        if(!currentSession) return
        const req = {
            type: "main",
            next: "right"
        }
        const mainResp = await examInteractWrapped(currentSession.id, req);
        setMainMsg(JSON.parse(mainResp.message!))
        const statisticsResp = await examInteractWrapped(currentSession.id, {type:"statistics"})
        setStatisticsMsg(JSON.parse(statisticsResp.message!))
    }
}

export const useHandleLayerDown = ()=>{
    const currentSession = useRecoilValue(CurrentExamSessionAtom)
    const [, setMainMsg] = useRecoilState(HeuristicMainMsgAtom)
    const [, setStatisticsMsg] = useRecoilState(HeuristicStatisticsMsgAtom)
    return async ()=>{
        if(!currentSession) return
        const req = {
            type: "main",
            next: "bottom"
        }
        const mainResp = await examInteractWrapped(currentSession.id, req);
        setMainMsg(JSON.parse(mainResp.message!))
        const statisticsResp = await examInteractWrapped(currentSession.id, {type:"statistics"})
        setStatisticsMsg(JSON.parse(statisticsResp.message!))
    }
}