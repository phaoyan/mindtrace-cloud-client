import {atom, useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {CurrentStudy} from "../../../../../service/data/Tracing";
import {
    addTraceCoverage, continueCurrentStudy, pauseCurrentStudy,
    removeCurrentStudy,
    removeTraceCoverage,
    settleCurrentStudy, startCurrentStudy
} from "../../../../../service/api/TracingApi";
import {SelectedKnodeIdAtom} from "../../../../../recoil/home/Knode";
import {HistoryStudyRecordKeyAtom, StudyTracesAtom} from "../HistoryStudyRecord/HistoryStudyRecordHooks";
import dayjs from "dayjs";
import {MessageApiAtom} from "../../../../../recoil/utils/DocumentData";
export const CurrentStudyAtom = atom<CurrentStudy | undefined>({
    key: "CurrentStudyAtom",
    default: undefined
})

export const useStartStudy = ()=>{
    const [currentStudy, setCurrentStudy] = useRecoilState(CurrentStudyAtom)
    return async ()=>{
        if(currentStudy) return
        setCurrentStudy(await startCurrentStudy())
    }
}
export const useRemoveCurrentStudy = ()=>{
    const setCurrentStudy = useSetRecoilState(CurrentStudyAtom)
    return async ()=>{
        await removeCurrentStudy()
        setCurrentStudy(undefined)
    }
}

export const useSettleCurrentStudy = ()=>{
    const [currentStudy, setCurrentStudy] = useRecoilState(CurrentStudyAtom)
    const [studyTraces, setStudyTraces] = useRecoilState(StudyTracesAtom)
    const [historyStudyRecordKey,setHistoryStudyRecordKey] = useRecoilState(HistoryStudyRecordKeyAtom)
    const messageApi = useRecoilValue(MessageApiAtom)
    return async ()=>{
        if(!currentStudy) return
        if(currentStudy.coverages.length === 0){
            messageApi.error("请至少选择一个知识点")
            return
        }
        setStudyTraces([...studyTraces, await settleCurrentStudy()])
        setCurrentStudy(undefined)
        setHistoryStudyRecordKey(historyStudyRecordKey + 1)
    }
}

export const usePauseCurrentStudy = ()=>{
    const [currentStudy, setCurrentStudy] = useRecoilState(CurrentStudyAtom)
    return async ()=>{
        if( !currentStudy) return
        setCurrentStudy(await pauseCurrentStudy())
    }
}

export const useContinueCurrentStudy = ()=>{
    const [currentStudy, setCurrentStudy] = useRecoilState(CurrentStudyAtom)
    return async ()=> {
        if(!currentStudy) return
        setCurrentStudy(await continueCurrentStudy())
    }
}

export const useCalculateDuration = ()=>{
    const currentStudy = useRecoilValue(CurrentStudyAtom)
    return ()=>{
        if(!currentStudy) return 0
        const pauseList = currentStudy.trace.pauseList
        const continueList = currentStudy.trace.continueList
        let millis = dayjs().diff(currentStudy.trace.startTime)
        for(let i = 0; i < continueList.length; i ++){
            millis -= dayjs(continueList[i]).diff(pauseList[i])
        }
        if(pauseList.length > continueList.length)
            millis -= dayjs().diff(pauseList[pauseList.length-1])
        return millis
    }
}

export const useSetTitle = ()=>{
    const [currentStudy, setCurrentStudy] = useRecoilState(CurrentStudyAtom)
    return (title: string)=>{
        if(!currentStudy) return
        setCurrentStudy({...currentStudy, trace: {...currentStudy.trace, title: title}})
    }
}

export const useAddTraceCoverage = ()=>{
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [currentStudy, setCurrentStudy] = useRecoilState(CurrentStudyAtom)

    return async ()=>{
        if(!currentStudy) return
        setCurrentStudy({...currentStudy, coverages:await addTraceCoverage([selectedKnodeId])})
    }
}

export const useRemoveTraceCoverage = ()=>{
    const [currentStudy, setCurrentStudy] = useRecoilState(CurrentStudyAtom)

    return async (knodeId: number)=>{
        if(!currentStudy) return
        await removeTraceCoverage(knodeId)
        setCurrentStudy({...currentStudy, coverages: currentStudy.coverages.filter(coverage=>coverage.knodeId!==knodeId)})
    }
}