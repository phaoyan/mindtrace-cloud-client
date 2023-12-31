import {atom} from "recoil";

export const RelatedKnodeIdsAtom = atom<number[]>({
    key: "RelatedKnodeIdsAtom",
    default: []
})

export const CurrentUserSubscribesAtom = atom<number[]>({
    key: "CurrentUserSubscribesAtom",
    default: []
})

export const CurrentKnodeSubscribesAtom = atom<number[]>({
    key:"CurrentKnodeSubscribesAtom",
    default: []
})

export const CurrentEnhancerSubscribesAtom = atom<number[]>({
    key: "CurrentEnhancerSubscribesAtom",
    default: []
})