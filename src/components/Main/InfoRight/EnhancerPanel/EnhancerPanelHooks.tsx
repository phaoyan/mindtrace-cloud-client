import {removeEnhancer} from "../../../../service/api/EnhancerApi";
import {atom, useRecoilState, useRecoilValue} from "recoil";
import {EnhancersForSelectedKnodeAtom} from "../../../../recoil/home/Enhancer";
import {SelectedKnodeIdAtom} from "../../../../recoil/home/Knode";
import {useRemoveEnhancerId} from "../RecordPanel/CurrentStudyRecord/CurrentStudyRecordHooks";



export const EnhancerPanelCurrentPageAtom = atom({
    key: "EnhancerPanelCurrentPageAtom",
    default: 1
})

export const useHandleRemoveEnhancer = ()=>{
    const [enhancersForSelectedKnode, setEnhancersForSelectedKNode] = useRecoilState(EnhancersForSelectedKnodeAtom)
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const removeEnhancerIdInCurrentStudy = useRemoveEnhancerId()
    return async (enhancerId: number)=>{
        await removeEnhancer(enhancerId, selectedKnodeId)
        setEnhancersForSelectedKNode(enhancersForSelectedKnode.filter(enhancer=>enhancer.id !== enhancerId))
        await removeEnhancerIdInCurrentStudy(enhancerId)
    }
}