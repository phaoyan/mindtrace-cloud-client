import {atom, useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {CurrentStudy, StudyTrace} from "../../../../../service/data/Tracing";
import {
    addTraceEnhancerRelCurrent,
    continueCurrentStudy,
    editCurrentStudyTitle,
    getEnhancerIdsByTraceId,
    pauseCurrentStudy,
    removeCurrentStudy,
    removeTraceEnhancerRelCurrent,
    settleCurrentStudy,
    startCurrentStudy
} from "../../../../../service/api/TracingApi";
import {HistoryStudyRecordKeyAtom, LoadedTracesAtom} from "../HistoryStudyRecord/HistoryStudyRecordHooks";
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
    const [loadedTraces, setLoadedTraces] = useRecoilState(LoadedTracesAtom)
    const [historyStudyRecordKey,setHistoryStudyRecordKey] = useRecoilState(HistoryStudyRecordKeyAtom)
    const calculateDuration = useCalculateDuration()
    const messageApi = useRecoilValue(MessageApiAtom)
    return async ()=>{
        if(!currentStudy) return
        if(calculateDuration() <= 0){
            messageApi.error("时间不能为负")
            return
        }
        if(currentStudy.enhancerIds.length === 0){
            messageApi.error("请至少选择一个知识点")
            return
        }
        setLoadedTraces([...loadedTraces, await settleCurrentStudy()])
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
        const pauseList = currentStudy.pauseList
        const continueList = currentStudy.continueList
        const endTime = currentStudy.trace.endTime ? dayjs(currentStudy.trace.endTime) : dayjs()
        let millis = endTime.diff(currentStudy.trace.startTime)
        for(let i = 0; i < continueList.length; i ++)
            millis -= dayjs(continueList[i]).diff(pauseList[i])
        if(pauseList.length > continueList.length)
            millis -= endTime.diff(pauseList[pauseList.length-1])
        return millis + currentStudy.durationOffset * 1000
    }
}

export const useSetTitle = ()=>{
    const [currentStudy, setCurrentStudy] = useRecoilState(CurrentStudyAtom)
    return async (title: string)=>{
        if(!currentStudy) return
        setCurrentStudy({...currentStudy, trace: {...currentStudy.trace, title: title}})
        await editCurrentStudyTitle(title)
    }
}

export const useAddEnhancerId = ()=>{
    const [, setCurrentStudy] = useRecoilState(CurrentStudyAtom)
    return async (enhancerId: number)=>{
        setCurrentStudy((cur)=>{
            if(!cur || enhancerId in cur.enhancerIds) return cur
            addTraceEnhancerRelCurrent(enhancerId)
            return {...cur, enhancerIds: [...cur.enhancerIds, enhancerId]}
        })
    }
}

export const useLastStudyInfo = ()=>{
    const addEnhancerId = useAddEnhancerId()
    const setTitle = useSetTitle()
    return async (trace: StudyTrace)=> {
        let enhancerIds = await getEnhancerIdsByTraceId(trace.id)
        await setTitle(trace.title)
        await editCurrentStudyTitle(trace.title)
        for (let enhancerId of enhancerIds)
            await addEnhancerId(enhancerId)
    }
}


export const useRemoveEnhancerId = ()=>{
    const [currentStudy, setCurrentStudy] = useRecoilState(CurrentStudyAtom)
    return async (enhancerId: number)=>{
        if(!currentStudy) return
        setCurrentStudy({...currentStudy, enhancerIds: currentStudy.enhancerIds.filter(id=>id!==enhancerId)})
        await removeTraceEnhancerRelCurrent(enhancerId)
    }
}