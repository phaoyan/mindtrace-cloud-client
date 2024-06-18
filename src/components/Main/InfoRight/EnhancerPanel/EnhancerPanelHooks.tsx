import {getEnhancerGroupsByKnodeId, getEnhancersForKnode, removeEnhancer} from "../../../../service/api/EnhancerApi";
import {atom, useRecoilState, useRecoilValue} from "recoil";
import {EnhancersForSelectedKnodeAtom} from "../../../../recoil/home/Enhancer";
import {SelectedKnodeIdAtom} from "../../../../recoil/home/Knode";
import {useRemoveEnhancerId} from "../RecordPanel/CurrentStudyRecord/CurrentStudyRecordHooks";
import {useEffect} from "react";
import {Enhancer} from "../../../../service/data/Enhancer";
import {EnhancerGroup, EnhancerGroupsForSelectedKnodeAtom} from "./EnhancerGroupCard/EnhancerGroupCardHooks";
import {EnhancerPanelKeyAtom} from "../../../../recoil/utils/DocumentData";



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

export const useInitEnhancerPanelData = ()=>{
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [, setEnhancers] = useRecoilState<Enhancer[]>(EnhancersForSelectedKnodeAtom)
    const [, setEnhancerGroups] = useRecoilState<EnhancerGroup[]>(EnhancerGroupsForSelectedKnodeAtom)
    const [enhancerPanelKey, ] = useRecoilState(EnhancerPanelKeyAtom)
    useEffect(() => {
        const effect = async ()=>{
            if(!selectedKnodeId) return
            setEnhancers((await getEnhancersForKnode(selectedKnodeId)))
            setEnhancerGroups(await getEnhancerGroupsByKnodeId(selectedKnodeId))
        }; effect().then()
        // eslint-disable-next-line
    }, [selectedKnodeId, enhancerPanelKey])
}