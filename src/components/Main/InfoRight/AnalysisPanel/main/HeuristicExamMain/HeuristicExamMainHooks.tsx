import {useRecoilState, useRecoilValue} from "recoil";
import {CurrentExamSessionAtom} from "../../../../../../recoil/home/ExamSession";
import {examInteractWrapped} from "../../../../../../service/api/MasteryApi";
import {ExamSessionMsgAtom} from "../utils/GeneralHooks";


export const useHandleLayerUp = ()=>{
    const currentSession = useRecoilValue(CurrentExamSessionAtom)
    const [, setSessionMsg] = useRecoilState(ExamSessionMsgAtom)
    return async ()=>{
        if(!currentSession) return
        const req = {
            type: "main",
            next: "top"
        }
        const mainResp = await examInteractWrapped(currentSession.id, req);
        const statisticsResp = await examInteractWrapped(currentSession.id, {type:"statistics"})
        setSessionMsg({
            main: JSON.parse(mainResp.message!),
            statistics: JSON.parse(statisticsResp.message!)
        })
    }
}

export const useHandleLayerRight = ()=>{
    const currentSession = useRecoilValue(CurrentExamSessionAtom)
    const [, setSessionMsg] = useRecoilState(ExamSessionMsgAtom)
    return async ()=>{
        if(!currentSession) return
        const req = {
            type: "main",
            next: "right"
        }
        const mainResp = await examInteractWrapped(currentSession.id, req);
        const statisticsResp = await examInteractWrapped(currentSession.id, {type:"statistics"})
        setSessionMsg({
            main: JSON.parse(mainResp.message!),
            statistics: JSON.parse(statisticsResp.message!)
        })
    }
}

export const useHandleLayerDown = ()=>{
    const currentSession = useRecoilValue(CurrentExamSessionAtom)
    const [, setSessionMsg] = useRecoilState(ExamSessionMsgAtom)
    return async ()=>{
        if(!currentSession) return
        const req = {
            type: "main",
            next: "bottom"
        }
        const mainResp = await examInteractWrapped(currentSession.id, req);
        const statisticsResp = await examInteractWrapped(currentSession.id, {type:"statistics"})
        setSessionMsg({
            main: JSON.parse(mainResp.message!),
            statistics: JSON.parse(statisticsResp.message!)
        })
    }
}