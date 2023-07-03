import {atom} from "recoil";
import {defaultUserShare, UserShare} from "../../../../service/data/share/UserShare";

export interface UserSubscribe{
    id: number
    subscriberId: number
    subscriberKnodeId: number
    userId: number
}
export interface KnodeSubscribe{
    id: number
    subscriberId: number
    subscriberKnodeId: number
    knodeId: number
}
export interface EnhancerSubscribe{
    id: number
    subscriberId: number
    subscriberKnodeId: number
    enhancerId: number
}

export const RelatedKnodeIdsAtom = atom<number[]>({
    key: "RelatedKnodeIdsAtom",
    default: []
})

export const UserShareAtom = atom<UserShare>({
    key: "UserShareAtom",
    default: defaultUserShare
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