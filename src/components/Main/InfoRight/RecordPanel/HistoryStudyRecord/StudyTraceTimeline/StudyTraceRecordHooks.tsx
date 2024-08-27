import {atom, atomFamily, useRecoilState, useRecoilValue} from "recoil";
import {
    addTraceEnhancerRel,
    getKnodeIdsByTraceId,
    removeStudyTrace, removeTraceEnhancerRel,
} from "../../../../../../service/api/TracingApi";
import {StudyTrace} from "../../../../../../service/data/Tracing";
import {getChainStyleTitle} from "../../../../../../service/api/KnodeApi";
import {SelectedKnodeIdAtom} from "../../../../../../recoil/home/Knode";
import {CurrentTabAtom} from "../../../InfoRightHooks";
import {MessageApiAtom} from "../../../../../../recoil/utils/DocumentData";
import {getKnodesByEnhancerId} from "../../../../../../service/api/EnhancerApi";
import {HistoryStudyRecordKeyAtom, LoadedTracesAtom} from "../HistoryStudyRecordHooks";

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

export const EnhancerSearchTxtAtom = atom<string>({
    key: "EnhancerSearchTxtAtom",
    default: undefined
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
        const coverages = await getKnodeIdsByTraceId(trace.id);
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

export const useAddEnhancerRelByGroup = ()=>{
    const [, setComponentKey] = useRecoilState(HistoryStudyRecordKeyAtom)
    return async (enhancerId: number, traces: StudyTrace[])=>{
        for (let trace of traces.filter(tr=>!!tr))
            await addTraceEnhancerRel(trace.id, enhancerId)
        setComponentKey(key=>key+1)
    }
}

