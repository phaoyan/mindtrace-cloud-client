import {atom} from "recoil";
import {Enhancer} from "../../service/data/Enhancer";

export const EnhancersForSelectedKnodeAtom = atom<Enhancer[]>({
    key: "EnhancersForSelectedKnodeAtom",
    default:[],
})

// 第一个number：enhancerId；第二个number：knodeId
export const EnhancerCardIdClipboardAtom = atom<number[] | undefined>({
    key:"EnhancerCardIdClipboardAtom",
    default: undefined
})