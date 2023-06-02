import {atom, DefaultValue, selectorFamily} from "recoil";
import {Enhancer, Label} from "../../service/data/Enhancer";

export const EnhancersForSelectedKnodeAtom = atom<Enhancer[]>({
    key: "EnhancersForSelectedKnodeAtom",
    default:[],
})

export const EnhancerSelector = selectorFamily<Enhancer | undefined, number>({
    key:"EnhancerSelector",
    get: (id)=>({get})=>get(EnhancersForSelectedKnodeAtom).find(enhancer=>enhancer.id === id),
    set: (id)=>({get, set}, newValue)=> {
        if(newValue && !(newValue instanceof DefaultValue))
            set(EnhancersForSelectedKnodeAtom,
                [...get(EnhancersForSelectedKnodeAtom)
                .filter(enhancer => enhancer.id !== id),
                newValue])
    }
})

export const EnhancerLabelRepositoryAtom = atom<Label[]>({
    key:"EnhancerLabelRepositoryAtom",
    default: []
})

// 第一个number：enhancerId；第二个number：knodeId
export const EnhancerCardIdClipboardAtom = atom<number[] | undefined>({
    key:"EnhancerCardIdClipboardAtom",
    default: undefined
})