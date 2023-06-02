import {atom, selector} from "recoil";
import {ExamSession} from "../../service/data/mastery/ExamSession";
import {ExamStrategy} from "../../service/data/mastery/ExamStrategy";
import {ExamInteract} from "../../service/data/mastery/ExamInteract";

export const CurrentExamSessionAtom = atom<ExamSession | undefined>({
    key:"CurrentExamSessionAtom",
    default: undefined
})

export const CurrentExamStrategySelector = selector<ExamStrategy>({
    key:"CurrentExamStrategySelector",
    get: ({get})=> {
        const session = get(CurrentExamSessionAtom);
        if(session)
            return JSON.parse(session.exam.examStrategy)
    }
})

export const CurrentInteractBack1Selector = selector<ExamInteract|undefined>({
    key:"CurrentInteractBack1Selector",
    get: ({get})=>{
        const session = get(CurrentExamSessionAtom);
        if(session)
            return session.interacts.length === 0 ? undefined : session.interacts[session.interacts.length - 1]
    }
})
