import {atom, useRecoilState, useRecoilValue} from "recoil";
import {SelectedKnodeIdAtom} from "../../../../../../recoil/home/Knode";
import {useEffect,} from "react";
import {
    getStudyTraceEnhancerGroupInfo,
    getStudyTraceEnhancerInfoUnderKnode
} from "../../../../../../service/api/TracingApi";
import {
    EnhancerGroupsForSelectedKnodeAtom,
} from "../../../EnhancerPanel/EnhancerGroupCard/EnhancerGroupCardHooks";

export const EnhancerRecordInfoListAtom = atom<any[]>({
    key: "EnhancerTimeDistributionAtom",
    default: []
})

export const EnhancerGroupRecordInfoListAtom = atom<any[]>({
    key: "EnhancerGroupRecordInfoListAtom",
    default: []
})

export const EnhancerRecordPanelCurrentPageAtom = atom<number>({
    key: "EnhancerRecordPanelCurrentPageAtom",
    default: 1
})

export const useInitEnhancerRecordData = ()=>{
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [enhancerGroups, ] = useRecoilState(EnhancerGroupsForSelectedKnodeAtom);
    const [, setEnhancerInfoList] = useRecoilState(EnhancerRecordInfoListAtom)
    const [, setEnhancerGroupInfoList] = useRecoilState(EnhancerGroupRecordInfoListAtom)
    useEffect(()=>{
        const effect = async ()=>{
            const resp = await getStudyTraceEnhancerInfoUnderKnode(selectedKnodeId)
            const enhancerInfoList = []
            const enhancerGroupInfoList = []
            for(let info of resp)
                enhancerInfoList.push(info)
            setEnhancerInfoList(enhancerInfoList.sort((a,b)=>b.duration - a.duration))
            for(let group of enhancerGroups)
                enhancerGroupInfoList.push(await getStudyTraceEnhancerGroupInfo(group.id))
            setEnhancerGroupInfoList(enhancerGroupInfoList)
        }; effect().then()
        //eslint-disable-next-line
    }, [selectedKnodeId])
}