import {atom} from "recoil";
import {LearningTrace} from "../service/data/Mindtrace";

export const LearningTraceAtom = atom<LearningTrace>({
    key:"LearningTraceAtom",
    default: undefined
})
