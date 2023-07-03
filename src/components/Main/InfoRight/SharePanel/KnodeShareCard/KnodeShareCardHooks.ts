import {getEnhancerById} from "../../../../../service/api/EnhancerApi";
import {atom, useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {CurrentUserAtom} from "../../../Main/MainHooks";
import {User} from "../../../../../service/data/Gateway";
import {KnodeShare} from "../../../../../service/data/share/KnodeShare";
import {SelectedKnodeIdAtom} from "../../../../../recoil/home/Knode";
import {CurrentTabAtom} from "../../InfoRightHooks";
import {
    getKnodeSubscribes,
    getUserSubscribes, removeKnodeSubscribe, removeUserSubscribe,
    subscribeKnode,
    subscribeUser
} from "../../../../../service/api/ShareApi";
import {CurrentKnodeSubscribesAtom, CurrentUserSubscribesAtom} from "../SharePanelHooks";

export const KnodeIdBeforeVisitAtom = atom<number|undefined>({
    key: "KnodeIdBeforeVisitAtom",
    default: undefined
})

export const useEnhancerExists = ()=>{
    return async (enhancerId: number)=>{
        const enhancer = await getEnhancerById(enhancerId)
        return !!enhancer
    }
}

export const useVisit = ()=>{
    const setCurrentUser = useSetRecoilState(CurrentUserAtom)
    const setCurrentTab = useSetRecoilState(CurrentTabAtom)
    const setKnodeIdBeforeVisit = useSetRecoilState(KnodeIdBeforeVisitAtom)
    const [selectedKnodeId, setSelectedKnodeId] = useRecoilState(SelectedKnodeIdAtom)
    return async (owner: User, knodeShare?: KnodeShare)=>{
        setKnodeIdBeforeVisit(selectedKnodeId)
        setCurrentUser(owner)
        setSelectedKnodeId(knodeShare ? knodeShare.knodeId: -1)
        setCurrentTab("note")
    }
}

export const useSubscribeKnode = ()=>{
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const setKnodeSubscribes = useSetRecoilState(CurrentKnodeSubscribesAtom)
    return async (subscriberKnodeId: number, knodeId: number)=>{
        await subscribeKnode(subscriberKnodeId, knodeId)
        if(selectedKnodeId === subscriberKnodeId)
            setKnodeSubscribes(await getKnodeSubscribes(selectedKnodeId))
    }
}

export const useSubscribeUser = ()=>{
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const setUserSubscribes = useSetRecoilState(CurrentUserSubscribesAtom)
    return async (subscriberKnodeId: number, userId: number)=>{
        await subscribeUser(subscriberKnodeId, userId)
        if(selectedKnodeId === subscriberKnodeId)
            setUserSubscribes(await getUserSubscribes(selectedKnodeId))
    }
}

export const useRemoveKnodeSubscribe = ()=>{
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const setKnodeSubscribes = useSetRecoilState(CurrentKnodeSubscribesAtom)
    return async (subscriberKnodeId: number, knodeId: number)=>{
        await removeKnodeSubscribe(subscriberKnodeId, knodeId)
        if(selectedKnodeId === subscriberKnodeId)
            setKnodeSubscribes(await getKnodeSubscribes(selectedKnodeId))
    }
}

export const useRemoveUserSubscribe = ()=>{
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const setUserSubscribes = useSetRecoilState(CurrentUserSubscribesAtom)
    return async (subscriberKnodeId: number, userId: number)=>{
        await removeUserSubscribe(subscriberKnodeId, userId)
        if(selectedKnodeId === subscriberKnodeId)
            setUserSubscribes(await getUserSubscribes(selectedKnodeId))
    }
}