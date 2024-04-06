import {atomFamily, useRecoilState, useRecoilValue} from "recoil";
import {
    addMilestoneTraceRel, addTraceEnhancerRel,
    getStudyTracesInMilestone,
    getTraceKnodeRels, removeMilestoneTraceRel,
    removeStudyTrace, removeTraceEnhancerRel,
} from "../../../../../../service/api/TracingApi";
import {StudyTrace} from "../../../../../../service/data/Tracing";
import {getChainStyleTitle} from "../../../../../../service/api/KnodeApi";
import {SelectedKnodeIdAtom} from "../../../../../../recoil/home/Knode";
import {CurrentTabAtom} from "../../../InfoRightHooks";
import {MessageApiAtom} from "../../../../../../recoil/utils/DocumentData";
import {getKnodesByEnhancerId} from "../../../../../../service/api/EnhancerApi";
import {
    MilestoneTracesAtomFamily,
    SelectedMilestoneIdAtom,
    SelectedMilestoneTracesSelector
} from "../MilestonePanel/MilestonePanelHooks";
import {LoadedTracesAtom} from "../HistoryStudyRecordHooks";

export const TraceKnodeRelAtomFamily = atomFamily<number[], number>({
    key: "TraceKnodeRelAtomFamily",
    default: []
})

export const TraceEnhancerRelAtomFamily = atomFamily<number[], number>({
    key: "TraceEnhancerRelAtomFamily",
    default: []
})

export const RelKnodeChainTitlesFamily = atomFamily<{knodeId: number, title: string[]}[], number>({
    key: "RelKnodeChainTitlesFamily",
    default: []
})

export const RelEnhancerTitlesFamily = atomFamily<{enhancerId: number, title: string}[], number>({
    key: "RelEnhancerTitlesFamily",
    default: []
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

export const useRemoveEnhancerRel = (trace:StudyTrace)=>{
    const [,setRels] = useRecoilState(TraceEnhancerRelAtomFamily(trace.id));
    return async (traceId: number, enhancerId: number)=>{
        await removeTraceEnhancerRel(traceId, enhancerId)
        setRels(rels=>rels.filter(rel=>rel !== enhancerId))
    }
}

export const useAddEnhancerRel = (trace:StudyTrace)=>{
    const [,setRels] = useRecoilState(TraceEnhancerRelAtomFamily(trace.id));
    return async (traceId: number, enhancerId: number)=>{
        await addTraceEnhancerRel(traceId, enhancerId)
        setRels(rels=>[...new Set([...rels, enhancerId])])
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