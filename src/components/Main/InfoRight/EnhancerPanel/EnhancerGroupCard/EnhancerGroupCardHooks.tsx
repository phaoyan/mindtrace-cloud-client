import {atom, atomFamily, selector, useRecoilState, useRecoilValue} from "recoil";
import {useEffect} from "react";
import {SelectedKnodeIdAtom} from "../../../../../recoil/home/Knode";
import {getAncestors} from "../../../../../service/api/KnodeApi";
import {
    addResourceToEnhancerGroup,
    getEnhancerGroupsByKnodeId,
    removeEnhancerGroup, removeEnhancerGroupRel
} from "../../../../../service/api/EnhancerApi";
import {Resource} from "../EnhancerCard/EnhancerCardHooks";
import {LoginUserIdSelector} from "../../../../Login/LoginHooks";
import {EnhancerPanelKeyAtom} from "../../../../../recoil/utils/DocumentData";

export interface EnhancerGroup{
    id: number,
    userId: number,
    title: string,
    createTime: string,
}

export const EnhancerGroupAtomFamily = atomFamily<EnhancerGroup, number>({
    key: "EnhancerGroupAtomFamily",
    default: undefined
})

export const GroupRelatedEnhancerIdsAtomFamily = atomFamily<number[], number>({
    key: "GroupRelatedEnhancerIdsAtomFamily",
    default: []
})

export const GroupTraceInfoAtomFamily = atomFamily<any, number>({
    key: "GroupTraceInfoAtomFamily",
    default: undefined
})

export const EnhancerGroupResourcesAtomFamily = atomFamily<Resource[], number>({
    key: "EnhancerGroupResourcesAtomFamily",
    default: []
})

export const EnhancerGroupsForSelectedKnodeAtom = atom<EnhancerGroup[]>({
    key: "EnhancerGroupsForSelectedKnodeAtom",
    default: []
})

export const SelectedKnodeEnhancerIdsInGroupSelector = selector<number[]>({
    key: "SelectedKnodeEnhancerIdsInGroupSelector",
    get: ({get})=>{
        const groups = get(EnhancerGroupsForSelectedKnodeAtom);
        return  groups.map(group=>get(GroupRelatedEnhancerIdsAtomFamily(group.id))).flat();
    }
})

export const SelectedKnodeAncestorEnhancerGroupsAtom = atom<EnhancerGroup[]>({
    key: "SelectedKnodeAncestorEnhancerGroupsSelector",
    default: []
})

export const EnhancerRelGroupIdsAtomFamily = atomFamily<number[], number>({
    key: "EnhancerRelGroupIdAtomFamily",
    default: []
})

export const useGetAncestorEnhancerGroups = ()=>{
    const [selectedKnodeId,] = useRecoilState(SelectedKnodeIdAtom)
    return async ()=>{
        const knodes = await getAncestors(selectedKnodeId);
        const knodeIds = knodes.map(knode=>knode.id);
        const groups = []
        for(let knodeId of knodeIds)
            groups.push(...(await getEnhancerGroupsByKnodeId(knodeId)))
        return groups
    }
}

export const useInitSelectedKnodeAncestorEnhancerGroups = ()=>{
    const [selectedKnodeId,] = useRecoilState(SelectedKnodeIdAtom)
    const [, setEnhancerGroups] = useRecoilState(SelectedKnodeAncestorEnhancerGroupsAtom)
    const getAncestorEnhancerGroups = useGetAncestorEnhancerGroups();
    useEffect(()=>{
        const effect = async ()=>{
            setEnhancerGroups(await getAncestorEnhancerGroups())
        }; effect().then()
        //eslint-disable-next-line
    }, [selectedKnodeId])
}

export const useAddResourceToEnhancerGroup = (groupId: number)=>{
    const userId = useRecoilValue(LoginUserIdSelector);
    const [resources, setResources] = useRecoilState(EnhancerGroupResourcesAtomFamily(groupId))
    return async (type: string)=>{
        setResources([...resources, await addResourceToEnhancerGroup(groupId, userId, type)])
    }
}
export const useRemoveEnhancerGroup = (groupId: number)=>{
    const [, setEnhancerGroups] = useRecoilState(EnhancerGroupsForSelectedKnodeAtom)
    const [, setAncestorEnhancerGroups] = useRecoilState(SelectedKnodeAncestorEnhancerGroupsAtom)
    const getAncestorEnhancerGroups = useGetAncestorEnhancerGroups();
    return async ()=>{
        await removeEnhancerGroup(groupId)
        setEnhancerGroups(groups=>groups.filter(group=>group.id!==groupId))
        setAncestorEnhancerGroups(await getAncestorEnhancerGroups())
    }
}

export const useRemoveEnhancerGroupRel = ()=>{
    const [, setEnhancerPanelKey] = useRecoilState(EnhancerPanelKeyAtom);
    return async (enhancerId: number, groupId: number)=>{
        await removeEnhancerGroupRel(enhancerId, groupId)
        setEnhancerPanelKey((key)=>key + 1)
    }
}