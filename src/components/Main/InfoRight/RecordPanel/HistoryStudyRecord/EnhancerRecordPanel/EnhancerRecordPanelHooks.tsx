import {atom, useRecoilState, useRecoilValue} from "recoil";
import {SelectedKnodeIdAtom} from "../../../../../../recoil/home/Knode";
import {useEffect,} from "react";
import {
    getStudyTraceEnhancerGroupInfo,
    getStudyTraceEnhancerInfoUnderKnode
} from "../../../../../../service/api/TracingApi";
import {
    EnhancerGroupsForSelectedKnodeAtom,
} from "../../../EnhancerPanel/EnhancerGroupCard/EnhancerGroupCardHooks";
import {AccumulateDurationAtom} from "../HistoryStudyRecordHooks";
import {ItemType} from "antd/es/menu/hooks/useItems";

export interface StudyTraceEnhancerInfo {
    enhancerId: number,
    title: string,
    duration: number,
    review: number,
    traceIds: number[]
}

export const EnhancerRecordInfoListAtom = atom<any[]>({
    key: "EnhancerTimeDistributionAtom",
    default: []
})

export const EnhancerGroupRecordInfoListAtom = atom<any[]>({
    key: "EnhancerGroupRecordInfoListAtom",
    default: []
})

export const EnhancerRecordPanelCurrentPageAtom = atom<number>({
    key: "EnhancerRecordPanelCurrentPageAtom",
    default: 1
})

export const EnhancerRecordMinDurationAtom = atom<number>({
    key: "EnhancerRecordMinDurationAtom",
    default: 0
})

export const EnhancerRecordPanelOrderAtom = atom<string>({
    key: "EnhancerRecordPanelOrderAtom",
    default: "duration"
})

export const useEnhancerRecordPanelOrderItems = (): ItemType[]=>{
    const [, setOrder] = useRecoilState(EnhancerRecordPanelOrderAtom)
    return [
        {
            key: "duration",
            label: "按时长排序",
            onClick: (data)=> setOrder(data.key),
        },
        {
            key: "start",
            label: "按开始时间排序",
            onClick: (data)=> setOrder(data.key),
        }
    ]
}

export const useSortRecords = ()=>{
    const accumulatedDuration = useRecoilValue(AccumulateDurationAtom)

    return (infoList: StudyTraceEnhancerInfo[], order: string): any[]=>{
        if(order==="duration")
            return infoList.sort((a,b)=>b.duration - a.duration)
        else if(order==="start")
            return infoList.sort((a,b)=>accumulatedDuration[a.traceIds[a.traceIds.length-1]] - accumulatedDuration[b.traceIds[b.traceIds.length-1]])
        else return []
    }
}

export const useInitEnhancerRecordData = ()=>{
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [enhancerGroups, ] = useRecoilState(EnhancerGroupsForSelectedKnodeAtom);
    const [, setEnhancerInfoList] = useRecoilState(EnhancerRecordInfoListAtom)
    const [, setEnhancerGroupInfoList] = useRecoilState(EnhancerGroupRecordInfoListAtom)
    useEffect(()=>{
        const effect = async ()=>{
            const resp = await getStudyTraceEnhancerInfoUnderKnode(selectedKnodeId)
            const enhancerInfoList = []
            const enhancerGroupInfoList = []
            for(let info of resp)
                enhancerInfoList.push(info)
            setEnhancerInfoList(enhancerInfoList.sort((a,b)=>b.duration - a.duration))
            for(let group of enhancerGroups)
                enhancerGroupInfoList.push(await getStudyTraceEnhancerGroupInfo(group.id))
            setEnhancerGroupInfoList(enhancerGroupInfoList)
        }; effect().then()
        //eslint-disable-next-line
    }, [selectedKnodeId])
}