import {atom, useRecoilState} from "recoil";
import {
    CurrentExamSessionAtom,
} from "../../../../../../recoil/home/ExamSession";
import {finishExamSession} from "../../../../../../service/api/MasteryApi";

export const ExamSessionMsgAtom = atom<any>({
    key: "ExamSessionMsgAtom",
    default: {}
})
export const useFinish = ()=>{
    const [currentSession, setCurrentSession] = useRecoilState(CurrentExamSessionAtom)
    const [,setExamSessionMsg] = useRecoilState(ExamSessionMsgAtom)
    return async ()=>{
        if(!currentSession) return
        await finishExamSession(currentSession.id)
        setCurrentSession(undefined)
        setExamSessionMsg({})
    }
}

