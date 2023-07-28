import {removeEnhancer} from "../../../../service/api/EnhancerApi";
import {useRecoilState, useRecoilValue} from "recoil";
import {EnhancersForSelectedKnodeAtom} from "../../../../recoil/home/Enhancer";
import {SelectedKnodeIdAtom} from "../../../../recoil/home/Knode";

export const useHandleRemoveEnhancer = ()=>{
    const [enhancersForSelectedKnode, setEnhancersForSelectedKNode] = useRecoilState(EnhancersForSelectedKnodeAtom)
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    return async (enhancerId: number)=>{
        await removeEnhancer(enhancerId, selectedKnodeId)
        setEnhancersForSelectedKNode(enhancersForSelectedKnode.filter(enhancer=>enhancer.id !== enhancerId))
    }
}