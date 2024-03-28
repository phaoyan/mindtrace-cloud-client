import {removeEnhancer} from "../../../../service/api/EnhancerApi";
import {atom, useRecoilState, useRecoilValue} from "recoil";
import {EnhancersForSelectedKnodeAtom} from "../../../../recoil/home/Enhancer";
import {SelectedKnodeIdAtom} from "../../../../recoil/home/Knode";



export const EnhancerPanelCurrentPageAtom = atom({
    key: "EnhancerPanelCurrentPageAtom",
    default: 1
})

export const useHandleRemoveEnhancer = ()=>{
    const [enhancersForSelectedKnode, setEnhancersForSelectedKNode] = useRecoilState(EnhancersForSelectedKnodeAtom)
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    return async (enhancerId: number)=>{
        await removeEnhancer(enhancerId, selectedKnodeId)
        setEnhancersForSelectedKNode(enhancersForSelectedKnode.filter(enhancer=>enhancer.id !== enhancerId))
    }
}