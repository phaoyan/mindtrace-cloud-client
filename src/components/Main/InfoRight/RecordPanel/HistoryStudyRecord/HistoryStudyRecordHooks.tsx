import {atom, useRecoilState, useRecoilValue} from "recoil";
import {StudyTrace} from "../../../../../service/data/Tracing";
import {
    addMilestoneTraceRel, getStudyTracesInMilestone,
    getTraceKnodeRels, removeMilestoneTraceRel,
    removeStudyTrace,
} from "../../../../../service/api/TracingApi";
import {getChainStyleTitle} from "../../../../../service/api/KnodeApi";
import {SelectedKnodeIdAtom,} from "../../../../../recoil/home/Knode";
import {getKnodesByEnhancerId} from "../../../../../service/api/EnhancerApi";
import {MessageApiAtom} from "../../../../../recoil/utils/DocumentData";
import {CurrentTabAtom} from "../../InfoRightHooks";
import {
    MilestoneTracesAtomFamily,
    SelectedMilestoneIdAtom,
    SelectedMilestoneTracesSelector
} from "./MilestonePanel/MilestonePanelHooks";

export const LoadedTracesAtom = atom<StudyTrace[]>({
    key: "LoadedTracesAtom",
    default: []
})

export const HistoryStudyRecordKeyAtom = atom<number>({
    key: "HistoryStudyRecordKeyAtom",
    default: 0
})

export const AccumulateDurationAtom = atom<any>({
    key: "AccumulateDurationAtom",
    default: {}
})

export const StatisticDisplayAtom = atom<
    "calendar" | "data" | "history" |
    "knode distribution" | "enhancer distribution" |
    "enhancer trace timeline" | "milestone">({
    key: "StatisticDisplayAtom",
    default: "history"
})

export const useRemoveTraceRecord = ()=>{
    const [studyTraces, setStudyTraces] = useRecoilState(LoadedTracesAtom)
    return async (traceId: number)=>{
        await removeStudyTrace(traceId)
        setStudyTraces(studyTraces.filter(trace=>trace.id !== traceId))
    }
}

export const useCalculateTitle = ()=>{
    return async (trace: StudyTrace)=>{
        if(!trace) return ""
        if(trace.title) return trace.title
        const coverages = await getTraceKnodeRels(trace.id);
        if(coverages.length === 0) return ""
        const chainStyleTitle = await getChainStyleTitle(coverages[0]);
        if(chainStyleTitle.length === 0) return ""
        return chainStyleTitle[chainStyleTitle.length - 2]
    }
}

export const useJumpToEnhancer = ()=>{
    const [, setSelectedKnodeId] = useRecoilState(SelectedKnodeIdAtom)
    const [, setCurrentTab] = useRecoilState(CurrentTabAtom)
    const messageApi = useRecoilValue(MessageApiAtom)
    return async (enhancerId: number)=>{
        const knodes = await getKnodesByEnhancerId(enhancerId)
        if(knodes.length === 0){
            messageApi.error("找不到该笔记（或许已被删除）")
            return
        }
        setSelectedKnodeId(knodes[0].id)
        setCurrentTab("note")
    }
}

export const useAddMilestoneTraceRel = ()=>{
    const selectedMilestoneId = useRecoilValue(SelectedMilestoneIdAtom)
    const [, setMilestoneTraces] = useRecoilState(SelectedMilestoneTracesSelector)
    const [, setLoadedTraces] = useRecoilState(LoadedTracesAtom)
    return async (traceId: number)=>{
        if(!selectedMilestoneId) return
        await addMilestoneTraceRel(selectedMilestoneId, traceId)
        setMilestoneTraces(await getStudyTracesInMilestone(selectedMilestoneId))
        setLoadedTraces(traces=>traces.map(tr=>tr.id === traceId ? {...tr, milestoneId: selectedMilestoneId} : tr))
    }
}

export const useRemoveMilestoneTraceRel = (traceId: number, milestoneId?: number)=>{
    const [traces, setTraces] = useRecoilState(MilestoneTracesAtomFamily(milestoneId))
    const [, setLoadedTraces] = useRecoilState(LoadedTracesAtom)
    return async ()=>{
        await removeMilestoneTraceRel(milestoneId!, traceId)
        setTraces(traces.filter(trace=>trace.id !== traceId))
        setLoadedTraces(traces=>traces.map(tr=>tr.id === traceId ? {...tr, milestoneId: undefined} : tr))
    }
}