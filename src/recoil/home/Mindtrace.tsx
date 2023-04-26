import {atom} from "recoil";


export const LearningTraceSubmitSignalAtom = atom<boolean>({
    key:"LearningTraceSubmitSignalAtom",
    default: false
})

export const SelectedLeafIdsAtom = atom<number[]>({
    key:"SelectedLeavesAtom",
    default:[]
})