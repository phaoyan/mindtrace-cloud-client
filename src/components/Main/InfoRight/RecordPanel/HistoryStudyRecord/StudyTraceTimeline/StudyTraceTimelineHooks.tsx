import React, {useEffect} from "react";
import {
    getCurrentMonthStudyTime, getGroupByIdBatch, getGroupMappingByTraceIds,
    getStudyTimeAccumulation,
    getStudyTracesOfKnode, removeTraceGroupRel,
} from "../../../../../../service/api/TracingApi";
import dayjs from "dayjs";
import {formatMillisecondsToHHMM} from "../../../../../../service/utils/TimeUtils";
import {atom, selector, useRecoilState, useRecoilValue} from "recoil";
import {SelectedKnodeIdAtom} from "../../../../../../recoil/home/Knode";
import {CurrentStudyAtom} from "../../CurrentStudyRecord/CurrentStudyRecordHooks";
import {AccumulateDurationAtom, LoadedTracesAtom} from "../HistoryStudyRecordHooks";
import {StudyTraceRecord} from "./StudyTraceRecord";
import {TraceGroup} from "../../../../../../service/data/Tracing";
import StudyTraceGroup from "./StudyTraceGroup";

export const StudyTraceTimelineCurrentPageAtom = atom<number>({
    key: "StudyTraceTimelineCurrentPageAtom",
    default: 1
})

export const StudyTraceTimelinePageSizeAtom = atom<number>({
    key: "StudyTraceTimelinePageSizeAtom",
    default: 10
})

export const StudyTimePerDayCurrentMonthAtom = atom<string>({
    key: "StudyTimePerDayCurrentMonthAtom",
    default: undefined
})
export const TraceGroupMappingAtom = atom<{[key: number]: number}>({
    key: "TraceGroupMappingAtom",
    default: {}
})

export const GroupTraceMappingAtom = atom<{[key: number]: any[]}>({
    key: "GroupTraceMappingAtom",
    default: {}
})

export const GroupTimeMappingAtom = atom<{[key: number]: string}>({
    key: "GroupTimeMappingAtom",
    default: {}
})

export const TraceGroupsAtom = atom<TraceGroup[]>({
    key: "TraceGroupsAtom",
    default: []
})

export const StudyTraceGroupingAtom = atom<number[] | undefined>({
    key: "StudyTraceGroupingAtom",
    default: undefined
})

export const StudyTraceTimelineRecordsSelector = selector({
    key: "StudyTraceTimelineRecordsSelector",
    get: ({get})=>{
        const traces = get(LoadedTracesAtom)
        const groups = get(TraceGroupsAtom)
        const traceGroupMapping = get(TraceGroupMappingAtom)
        const groupTimeMapping = get(GroupTimeMappingAtom)
        const traceRecords = traces
            .filter(trace=>!Object.keys(traceGroupMapping).includes(trace.id.toString()))
            .map((trace)=>({
                children: <StudyTraceRecord key={trace.id} trace={trace}/>,
                time: trace.startTime}))
        const traceGroupRecords = groups.map((group)=>{
            return {
                children: <StudyTraceGroup group={group} time={groupTimeMapping[group.id]}/>,
                time: groupTimeMapping[group.id]
            }
        });
        return [...traceRecords, ...traceGroupRecords].sort((a, b)=>-dayjs(a.time).diff(dayjs(b.time)))
    }
})


export const useInitStudyTraceData = ()=>{
    const [selectedKnodeId,] = useRecoilState(SelectedKnodeIdAtom)
    const [, setStudyTimePerDayCurrentMonth] = useRecoilState(StudyTimePerDayCurrentMonthAtom)
    const currentStudy = useRecoilValue(CurrentStudyAtom)
    const [, setLoadedTraces] = useRecoilState(LoadedTracesAtom)
    const [, setAccumulatedDuration] = useRecoilState(AccumulateDurationAtom)

    useEffect(()=>{
        const effect = async ()=>{
            const traces = await getStudyTracesOfKnode(selectedKnodeId)
            traces.sort((a,b)=>dayjs(b.startTime).diff(a.startTime))
            setLoadedTraces(traces)
        }; effect().then()
        //eslint-disable-next-line
    }, [selectedKnodeId, !!currentStudy])
    useEffect(()=>{
        const effect = async ()=>{
            setAccumulatedDuration(await getStudyTimeAccumulation(selectedKnodeId))
            setStudyTimePerDayCurrentMonth(formatMillisecondsToHHMM(Math.round(  (await getCurrentMonthStudyTime(selectedKnodeId))/ dayjs().date()) * 1000))
        }; effect().then()
        //eslint-disable-next-line
    }, [selectedKnodeId, !!currentStudy])

}

export const useInitTraceGroupData = ()=>{
    const [loadedTraces, ] = useRecoilState(LoadedTracesAtom)
    const grouping = useRecoilValue(StudyTraceGroupingAtom);
    const initTraceGroupDataOnce = useInitTraceGroupDataOnce();

    useEffect(()=>{
        if(grouping) return
        const effect = async ()=>{
            await initTraceGroupDataOnce()
        }; effect().then()
        //eslint-disable-next-line
    }, [grouping, loadedTraces])
}

export const useInitTraceGroupDataOnce = ()=>{
    const [, setTraceGroupMapping] = useRecoilState(TraceGroupMappingAtom)
    const [, setGroupTraceMapping] = useRecoilState(GroupTraceMappingAtom)
    const [, setGroupTimeMapping] = useRecoilState(GroupTimeMappingAtom)
    const [, setTraceGroups] = useRecoilState(TraceGroupsAtom)
    const [loadedTraces, ] = useRecoilState(LoadedTracesAtom)

    return async ()=>{
        const mapping = await getGroupMappingByTraceIds(loadedTraces.map(trace=>trace.id));
        setTraceGroupMapping(mapping)
        setTraceGroups(await getGroupByIdBatch(Object.values(mapping)))
        const groupTimeMapping: {[key: number]: string} = {}
        const groupTraceMapping: {[key: number]: any[]} = {}
        for(let trace of loadedTraces.filter(trace=>Object.keys(mapping).includes(trace.id.toString()))){
            const groupId = mapping[trace.id]
            if(!groupTimeMapping[groupId] || dayjs(groupTimeMapping[groupId]).isAfter(trace.startTime))
                groupTimeMapping[groupId] = trace.startTime
            const traceRecord = {
                children: <StudyTraceRecord key={trace.id} trace={trace} groupId={groupId}/>,
                time: trace.startTime,
                data: trace
            }
            if(!!groupTraceMapping[groupId])
                groupTraceMapping[groupId] = [...groupTraceMapping[groupId], traceRecord]
            else
                groupTraceMapping[groupId] = [traceRecord]
        }
        setGroupTraceMapping(groupTraceMapping)
        setGroupTimeMapping(groupTimeMapping)
    }
}

export const useRemoveTraceGroupRel = ()=>{
    const initTraceGroupDataOnce = useInitTraceGroupDataOnce()
    return async (traceId: number, groupId: number)=>{
        await removeTraceGroupRel(traceId, groupId)
        await initTraceGroupDataOnce()
    }
}
