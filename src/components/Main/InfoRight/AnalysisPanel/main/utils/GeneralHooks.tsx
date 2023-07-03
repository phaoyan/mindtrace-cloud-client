import {useRecoilState} from "recoil";
import {CurrentExamSessionAtom} from "../../../../../../recoil/home/ExamSession";
import {ExamInteract} from "../../../../../../service/data/mastery/ExamInteract";
import {finishExamSession} from "../../../../../../service/api/MasteryApi";

export const useUpdateCurrentSession = ()=>{
    const [currentSession, setCurrentSession] = useRecoilState(CurrentExamSessionAtom)
    return (req: ExamInteract, resp: ExamInteract)=>{
        currentSession && setCurrentSession({...currentSession, interacts: [...currentSession.interacts, req, resp]})
    }
}

export const useFinish = ()=>{
    const [currentSession, setCurrentSession] = useRecoilState(CurrentExamSessionAtom)
    return async ()=>{
        if(!currentSession) return
        await finishExamSession(currentSession.id)
        setCurrentSession(undefined)
    }
}