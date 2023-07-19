import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {
    CurrentExamSessionAtom,
    ExamCurrentKnodeIdAtom,
    ExamCurrentQuizzesAtom
} from "../../../../../../recoil/home/ExamSession";
import {useEffect} from "react";
import {examInteractWrapped} from "../../../../../../service/api/MasteryApi";
import {getResourceById} from "../../../../../../service/api/ResourceApi";
import {ExamSessionMsgAtom} from "../utils/GeneralHooks";

export const useInitSessionMsgWithMainAndStatistics = ()=>{
    const currentSession = useRecoilValue(CurrentExamSessionAtom)
    const [, setSessionMsg] = useRecoilState(ExamSessionMsgAtom)
    useEffect(()=>{
        const effect = async ()=>{
            if(!currentSession) return
            const mainResp = await examInteractWrapped(currentSession.id, {type:"main"})
            const statisticsResp = await examInteractWrapped(currentSession.id, {type:"statistics"})
            setSessionMsg({
                main: JSON.parse(mainResp.message!),
                statistics: JSON.parse(statisticsResp.message!)
            })
        }; effect()
        //eslint-disable-next-line
    }, [currentSession])
}

export const useInitKnodeAndQuizzes = ()=>{
    const [sessionMsg, ] = useRecoilState(ExamSessionMsgAtom)
    const [, setCurrentQuiz] = useRecoilState(ExamCurrentQuizzesAtom)
    const setExamCurrentKnodeId = useSetRecoilState(ExamCurrentKnodeIdAtom)
    useEffect(()=>{
        const effect = async ()=>{
            if(!sessionMsg.main || !sessionMsg.main.quizIds || !sessionMsg.main.knodeId) return
            const temp = []
            for(let quizId of sessionMsg.main.quizIds)
                temp.push(await getResourceById(quizId))
            setCurrentQuiz(temp)
            setExamCurrentKnodeId(sessionMsg.main.knodeId)
        }; effect()
        //eslint-disable-next-line
    }, [sessionMsg.main])
}

export const useHandleRight = ()=>{
    const currentSession = useRecoilValue(CurrentExamSessionAtom)
    const [sessionMsg, setSessionMsg] = useRecoilState(ExamSessionMsgAtom)
    const [currentQuiz,] = useRecoilState(ExamCurrentQuizzesAtom)
    return async ()=>{
        if(!currentSession) return
        const req = {
            type:"main",
            layerId: sessionMsg.main.layerId,
            knodeId: sessionMsg.main.knodeId,
            quizIds: currentQuiz.map(quiz=>quiz.id),
            completion: true
        }
        const mainResp = await examInteractWrapped(currentSession.id, req);
        const statisticsResp = await examInteractWrapped(currentSession.id, {type:"statistics"})
        setSessionMsg({
            main: JSON.parse(mainResp.message!),
            statistics: JSON.parse(statisticsResp.message!)
        })
    }
}

export const useHandleWrong = ()=>{
    const currentSession = useRecoilValue(CurrentExamSessionAtom)
    const [sessionMsg, setSessionMsg] = useRecoilState(ExamSessionMsgAtom)
    const [currentQuiz,] = useRecoilState(ExamCurrentQuizzesAtom)
    return async ()=>{
        if(!currentSession) return
        const req = {
            type: "main",
            layerId: sessionMsg.main.layerId,
            knodeId: sessionMsg.main.knodeId,
            quizIds: currentQuiz.map(quiz=>quiz.id),
            completion: false
        }
        const mainResp = await examInteractWrapped(currentSession.id, req);
        const statisticsResp = await examInteractWrapped(currentSession.id, {type:"statistics"})
        setSessionMsg({
            main: JSON.parse(mainResp.message!),
            statistics: JSON.parse(statisticsResp.message!)
        })
    }
}