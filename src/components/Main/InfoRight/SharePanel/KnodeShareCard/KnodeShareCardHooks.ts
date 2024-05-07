import {getEnhancerById} from "../../../../../service/api/EnhancerApi";
import {atom, useRecoilValue, useSetRecoilState} from "recoil";
import {SelectedKnodeIdAtom} from "../../../../../recoil/home/Knode";
import {
    getKnodeSubscribes,
    getUserSubscribes, removeKnodeSubscribe, removeUserSubscribe,
    subscribeKnode,
    subscribeUser
} from "../../../../../service/api/ShareApi";
import {CurrentKnodeSubscribesAtom, CurrentUserSubscribesAtom} from "../SharePanelHooks";

export const KnodeIdBeforeVisitAtom = atom<number[]>({
    key: "KnodeIdBeforeVisitAtom",
    default: []
})

export const useEnhancerExists = ()=>{
    return async (enhancerId: number)=>{
        const enhancer = await getEnhancerById(enhancerId)
        return !!enhancer
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