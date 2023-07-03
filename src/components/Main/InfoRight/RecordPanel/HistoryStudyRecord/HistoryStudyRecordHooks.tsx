import {atom, useRecoilState, useRecoilValue} from "recoil";
import {StudyTrace} from "../../../../../service/data/Tracing";
import {getStudyTimeDistribution, getTraceCoverages, removeStudyTrace} from "../../../../../service/api/TracingApi";
import {getChainStyleTitle} from "../../../../../service/api/KnodeApi";
import {SelectedKnodeIdAtom, SelectedKtreeSelector} from "../../../../../recoil/home/Knode";
import React, {useEffect, useState} from "react";
import KnodeTitle from "../../../KnodeTitle/KnodeTitle";
import {Ktree} from "../../../../../service/data/Knode";
import {formatMillisecondsToHHMM} from "../../../../../service/utils/TimeUtils";


export const StudyTracesAtom = atom<StudyTrace[]>({
    key: "StudyTracesAtom",
    default: []
})

export const HistoryStudyRecordKeyAtom = atom<number>({
    key: "HistoryStudyRecordKeyAtom",
    default: 0
})

export const useRemoveTraceRecord = ()=>{
    const [studyTraces, setStudyTraces] = useRecoilState(StudyTracesAtom)
    return async (traceId: number)=>{
        await removeStudyTrace(traceId)
        setStudyTraces(studyTraces.filter(trace=>trace.id !== traceId))
    }
}

export const useCalculateTitle = ()=>{
    return async (trace: StudyTrace)=>{
        if(!trace) return ""
        if(trace.title) return trace.title
        const coverages = await getTraceCoverages(trace.id);
        if(coverages.length === 0) return ""
        const chainStyleTitle = await getChainStyleTitle(coverages[0]);
        if(chainStyleTitle.length === 0) return ""
        return chainStyleTitle[chainStyleTitle.length - 2]
    }
}

export interface KtreeTimeDistributionAntd{
    key: number,
    title: any,
    children: KtreeTimeDistributionAntd[]
}

export const useKtreeTimeDistributionAntd = ()=>{
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [timeDistributionAntd, setTimeDistributionAntd] = useState<KtreeTimeDistributionAntd>()
    const selectedKtree = useRecoilValue(SelectedKtreeSelector)
    useEffect(()=>{
        const effect = async ()=>{
            if(!selectedKtree) return
            const timeDistributionMap = await getStudyTimeDistribution(selectedKnodeId);
            setTimeDistributionAntd(convertKtreeAntd([selectedKtree], timeDistributionMap)[0])
        }; effect()
        //eslint-disable-next-line
    }, [selectedKnodeId])
    return timeDistributionAntd
}

const convertKtreeAntd = (ori: Ktree[], timeDistributionMap: any): KtreeTimeDistributionAntd[]=>{
    if (ori[0] == null) return []
    return ori.map(ktree => ({
        key: ktree.knode.id,
        title: (<div style={{display:"flex"}}>
            <KnodeTitle id={ktree?.knode.id!}/>
            <span style={{
                color:"#666666",
                fontStyle:"oblique",
                fontSize:"1.2em",
                marginLeft:"1em",
                position:"relative",
                top:"0.15em"
            }}>{
                timeDistributionMap[ktree.knode.id] !== 0 &&
                formatMillisecondsToHHMM(timeDistributionMap[ktree.knode.id]*1000)}
            </span>
        </div>),
        children: convertKtreeAntd(ktree.branches, timeDistributionMap)
    }))
}

export const useTimeDistributionExpandedKeys = ()=>{
    const selectedKtree = useRecoilValue(SelectedKtreeSelector)
    if(!selectedKtree) return []
    return [selectedKtree.knode.id, ...selectedKtree.branches.map(branch=>branch.knode.id)]
}