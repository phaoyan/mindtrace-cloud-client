import React, {useEffect} from "react";
import {
    getCurrentMonthStudyTime,
    getStudyTimeAccumulation,
    getStudyTracesOfKnode,
} from "../../../../../../service/api/TracingApi";
import dayjs from "dayjs";
import {formatMillisecondsToHHMM} from "../../../../../../service/utils/TimeUtils";
import {atom, useRecoilState, useRecoilValue} from "recoil";
import {SelectedKnodeIdAtom} from "../../../../../../recoil/home/Knode";
import {CurrentStudyAtom} from "../../CurrentStudyRecord/CurrentStudyRecordHooks";
import {AccumulateDurationAtom, LoadedTracesAtom} from "../HistoryStudyRecordHooks";
import {StudyTraceRecord} from "./StudyTraceRecord";
import {MilestoneCardsSelector} from "../MilestonePanel/MilestonePanelHooks";

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

export const TracesAndMilestonesAtom = atom<any[]>({
    key: "TracesAndMilestonesAtom",
    default: []
})

export const useInitStudyTraceData = ()=>{
    const [selectedKnodeId,] = useRecoilState(SelectedKnodeIdAtom)
    const [, setStudyTimePerDayCurrentMonth] = useRecoilState(StudyTimePerDayCurrentMonthAtom)
    const currentStudy = useRecoilValue(CurrentStudyAtom)
    const [loadedTraces,] = useRecoilState(LoadedTracesAtom)
    const milestoneCards = useRecoilValue(MilestoneCardsSelector)
    const [, setAccumulatedDuration] = useRecoilState(AccumulateDurationAtom)
    const [, setLoadedTraces] = useRecoilState(LoadedTracesAtom)
    const [, setTracesAndMilestones] = useRecoilState(TracesAndMilestonesAtom)

    useEffect(()=>{
        const effect = async ()=>{
            const traces = await getStudyTracesOfKnode(selectedKnodeId)
            traces.sort((a,b)=>dayjs(b.startTime).diff(a.startTime))
            setLoadedTraces(traces)
        }; effect().then()
        //eslint-disable-next-line
    }, [selectedKnodeId, !!currentStudy])
    // useEffect(()=>{
    //     const effect = async ()=>{
    //         const traces = await getStudyTracesOfKnodeByPage(selectedKnodeId, currentPage, pageSize)
    //         setLoadedTraces(loadedTraces=>[...loadedTraces, ...traces].sort((a,b)=>dayjs(b.startTime).diff(a.startTime)))
    //     }; effect().then()
    //     //eslint-disable-next-line
    // }, [currentPage, pageSize])
    useEffect(()=>{
        const effect = async ()=>{
            setAccumulatedDuration(await getStudyTimeAccumulation(selectedKnodeId))
            setStudyTimePerDayCurrentMonth(formatMillisecondsToHHMM(Math.round(  (await getCurrentMonthStudyTime(selectedKnodeId))/ dayjs().date()) * 1000))
        }; effect().then()
        //eslint-disable-next-line
    }, [selectedKnodeId, !!currentStudy])
    useEffect(()=>{
        const tracesAndMilestones = [
                ...loadedTraces
                    .filter(trace=>!trace.milestoneId)
                    .map((trace)=>({
                        children: <StudyTraceRecord key={trace.id} trace={trace}/>,
                        time: trace.startTime})),
                ...milestoneCards
            ].sort((a, b)=>-dayjs(a.time).diff(dayjs(b.time)))
        setTracesAndMilestones(tracesAndMilestones)
        //eslint-disable-next-line
    }, [loadedTraces, milestoneCards])
}