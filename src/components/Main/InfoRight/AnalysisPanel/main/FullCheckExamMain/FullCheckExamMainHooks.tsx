import {useRecoilState} from "recoil";
import {CurrentExamSessionAtom, ExamCurrentKnodeIdAtom} from "../../../../../../recoil/home/ExamSession";
import {examInteractWrapped} from "../../../../../../service/api/MasteryApi";
import {ExamSessionMsgAtom} from "../utils/GeneralHooks";

export const useHandleRight = ()=>{
    const [, setSessionMsg] = useRecoilState(ExamSessionMsgAtom)
    const [currentSession,] = useRecoilState(CurrentExamSessionAtom)
    const [currentKnodeId,] = useRecoilState(ExamCurrentKnodeIdAtom)
    return async ()=>{
        if(!currentSession) return
        const mainResp = await examInteractWrapped(currentSession.id, {
            type: "main",
            knodeId: currentKnodeId,
            completion: true
        })
        const statisticsResp = await examInteractWrapped(currentSession.id, {type:"statistics"})
        setSessionMsg({
            main: JSON.parse(mainResp.message!),
            statistics: JSON.parse(statisticsResp.message!)
        })
    }
}

export const useHandleWrong = ()=>{
    const [, setSessionMsg] = useRecoilState(ExamSessionMsgAtom)
    const [currentSession,] = useRecoilState(CurrentExamSessionAtom)
    const [currentKnodeId,] = useRecoilState(ExamCurrentKnodeIdAtom)
    return async ()=>{
        if(!currentSession) return
        const mainResp = await examInteractWrapped(currentSession.id, {
            type: "main",
            knodeId: currentKnodeId,
            completion: false
        })
        const statisticsResp = await examInteractWrapped(currentSession.id, {type:"statistics"})
        setSessionMsg({
            main: JSON.parse(mainResp.message!),
            statistics: JSON.parse(statisticsResp.message!)
        })
    }
}