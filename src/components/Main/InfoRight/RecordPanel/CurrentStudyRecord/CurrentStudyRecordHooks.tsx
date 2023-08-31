import {atom, useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {CurrentStudy} from "../../../../../service/data/Tracing";
import {
    addTraceEnhancerRel,
    addTraceKnodeRel, continueCurrentStudy, pauseCurrentStudy,
    removeCurrentStudy, removeTraceEnhancerRel,
    removeTraceKnodeRel,
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
        if(currentStudy.knodeIds.length === 0){
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
        const endTime = currentStudy.trace.endTime ? dayjs(currentStudy.trace.endTime) : dayjs()
        let millis = endTime.diff(currentStudy.trace.startTime)
        for(let i = 0; i < continueList.length; i ++)
            millis -= dayjs(continueList[i]).diff(pauseList[i])
        if(pauseList.length > continueList.length)
            millis -= endTime.diff(pauseList[pauseList.length-1])
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

export const useAddKnodeId = ()=>{
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [currentStudy, setCurrentStudy] = useRecoilState(CurrentStudyAtom)
    return async ()=>{
        if(!currentStudy) return
        await addTraceKnodeRel(selectedKnodeId)
        setCurrentStudy({...currentStudy, knodeIds: [...currentStudy.knodeIds, selectedKnodeId]})
    }
}

export const useAddEnhancerId = ()=>{
    const [currentStudy, setCurrentStudy] = useRecoilState(CurrentStudyAtom)
    return async (enhancerId: number)=>{
        if(!currentStudy) return
        await addTraceEnhancerRel(enhancerId)
        setCurrentStudy({...currentStudy, enhancerIds: [...currentStudy.enhancerIds, enhancerId]})
    }
}

export const useRemoveKnodeId = ()=>{
    const [currentStudy, setCurrentStudy] = useRecoilState(CurrentStudyAtom)
    return async (knodeId: number)=>{
        if(!currentStudy) return
        await removeTraceKnodeRel(knodeId)
        setCurrentStudy({...currentStudy, knodeIds: currentStudy.knodeIds.filter(id=>id!==knodeId)})
    }
}

export const useRemoveEnhancerId = ()=>{
    const [currentStudy, setCurrentStudy] = useRecoilState(CurrentStudyAtom)
    return async (enhancerId: number)=>{
        if(!currentStudy) return
        await removeTraceEnhancerRel(enhancerId)
        setCurrentStudy({...currentStudy, enhancerIds: currentStudy.enhancerIds.filter(id=>id!==enhancerId)})
    }
}