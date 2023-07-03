import {removeEnhancer} from "../../../../service/api/EnhancerApi";
import {useRecoilState} from "recoil";
import {EnhancersForSelectedKnodeAtom} from "../../../../recoil/home/Enhancer";

export const useHandleRemoveEnhancer = ()=>{
    const [enhancersForSelectedKnode, setEnhancersForSelectedKNode] = useRecoilState(EnhancersForSelectedKnodeAtom)
    return async (enhancerId: number)=>{
        await removeEnhancer(enhancerId)
        setEnhancersForSelectedKNode(enhancersForSelectedKnode.filter(enhancer=>enhancer.id !== enhancerId))
    }
}