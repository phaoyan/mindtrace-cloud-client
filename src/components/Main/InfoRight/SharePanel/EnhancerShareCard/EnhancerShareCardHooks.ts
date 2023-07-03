import {atomFamily, useRecoilValue, useSetRecoilState} from "recoil";
import {KnodeShare} from "../../../../../service/data/share/KnodeShare";
import {SelectedKnodeIdAtom} from "../../../../../recoil/home/Knode";
import {CurrentEnhancerSubscribesAtom} from "../SharePanelHooks";
import {getEnhancerSubscribes, removeEnhancerSubscribe, subscribeEnhancer} from "../../../../../service/api/ShareApi";

export const KnodeShareAtomFamily = atomFamily<KnodeShare | undefined, number>({
    key: "KnodeShareAtomFamily",
    default: undefined
})

export const useSubscribeEnhancer = ()=>{
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const setEnhancerSubscribes = useSetRecoilState(CurrentEnhancerSubscribesAtom)
    return async (subscriberKnodeId:number, enhancerId: number)=>{
        await subscribeEnhancer(subscriberKnodeId, enhancerId)
        if(selectedKnodeId === subscriberKnodeId)
            setEnhancerSubscribes(await getEnhancerSubscribes(selectedKnodeId))
    }
}

export const useRemoveEnhancerSubscribe = ()=>{
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const setEnhancerSubscribes = useSetRecoilState(CurrentEnhancerSubscribesAtom)
    return async (subscriberKnodeId:number, enhancerId: number)=>{
        await removeEnhancerSubscribe(subscriberKnodeId, enhancerId)
        if(selectedKnodeId === subscriberKnodeId)
            setEnhancerSubscribes(await getEnhancerSubscribes(selectedKnodeId))
    }
}