import {useEffect} from "react";
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

export const StudyTraceCountAtom = atom<number>({
    key: "StudyTraceCountAtom",
    default: 0
})

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

export const TimelineComponentKeyAtom = atom<number>({
    key: "TimelineComponentKeyAtom",
    default: 0
})

export const useInitStudyTraceData = ()=>{
    const [selectedKnodeId,] = useRecoilState(SelectedKnodeIdAtom)
    const [, setStudyTimePerDayCurrentMonth] = useRecoilState(StudyTimePerDayCurrentMonthAtom)
    const currentStudy = useRecoilValue(CurrentStudyAtom)
    const [, setAccumulatedDuration] = useRecoilState(AccumulateDurationAtom)
    const [, setLoadedTraces] = useRecoilState(LoadedTracesAtom)
    const [, setStudyTraceCount] = useRecoilState(StudyTraceCountAtom)

    useEffect(()=>{
        const effect = async ()=>{
            const traces = await getStudyTracesOfKnode(selectedKnodeId)
            traces.sort((a,b)=>dayjs(b.startTime).diff(a.startTime))
            setLoadedTraces(traces)
            setStudyTraceCount(traces.length)
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
}