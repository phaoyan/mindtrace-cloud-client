import {atom} from "recoil";
import {LearningTrace} from "../service/data/Mindtrace";

export const LearningTraceAtom = atom<LearningTrace | undefined>({
    key:"LearningTraceAtom",
    default: undefined
})
