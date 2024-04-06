import {atom} from "recoil";
import {StudyTrace} from "../../../../../service/data/Tracing";

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

