import {useRecoilState} from "recoil";
import {CurrentExamSessionAtom} from "../../../../../../recoil/home/ExamSession";
import {ExamInteract} from "../../../../../../service/data/mastery/ExamInteract";

export const useUpdateCurrentSession = ()=>{
    const [currentSession, setCurrentSession] = useRecoilState(CurrentExamSessionAtom)
    return (req: ExamInteract, resp: ExamInteract)=>{
        currentSession && setCurrentSession({...currentSession, interacts: [...currentSession.interacts, req, resp]})
    }
}