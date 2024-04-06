import {atom, atomFamily, useRecoilState,} from "recoil";
import {SelectedKnodeIdAtom} from "../../../../../../recoil/home/Knode";
import {CurrentTabAtom} from "../../../InfoRightHooks";
import {getMilestoneById} from "../../../../../../service/api/TracingApi";
import {StatisticDisplayAtom} from "../../../RecordPanel/HistoryStudyRecord/HistoryStudyRecordHooks";
import {addDataToResource} from "../../../../../../service/api/ResourceApi";

export const NoteLinkDataAtomFamily = atomFamily<{
    fromId: number,
    toId?: number,
    fromResourceId: number,
    toResourceId?: number,
    fromType: "enhancer" | "milestone",
    toType: "enhancer" | "milestone"
}, number>({
    key: "NoteLinkDataAtomFamily",
    default: undefined
})

export const NoteLinkAtom = atom<{ resourceId: number, placeId: number, placeType: "enhancer" | "milestone" } | undefined>({
    key: "NoteLinkAtom",
    default: undefined
})

export const useJumpToMilestone = () => {
    const [, setSelectedKnodeId] = useRecoilState(SelectedKnodeIdAtom)
    const [, setCurrentTab] = useRecoilState(CurrentTabAtom)
    const [, setStatisticDisplay] = useRecoilState(StatisticDisplayAtom);
    return async (milestoneId: number) => {
        const milestone = await getMilestoneById(milestoneId);
        setSelectedKnodeId(milestone.knodeId)
        setCurrentTab("record")
        setStatisticDisplay("milestone")
    }
}

export const useLinkNote = (resourceId: number) => {
    const [data, setData] = useRecoilState(NoteLinkDataAtomFamily(resourceId))
    const [link, setLink] = useRecoilState(NoteLinkAtom)
    return async () => {
        if (!link)
            setLink({resourceId: data.fromResourceId, placeId: data.fromId, placeType: data.fromType})
        else if (link.resourceId === data.fromResourceId)
            setLink(undefined)
        else {
            const linkTemp = link
            setLink(undefined)
            setData({...data, toId: linkTemp.placeId, toResourceId: linkTemp.resourceId, toType: linkTemp.placeType})
            await addDataToResource(linkTemp.resourceId, "data.json", {
                fromId: linkTemp.placeId,
                toId: data.fromId,
                fromResourceId: linkTemp.resourceId,
                toResourceId: data.fromResourceId,
                fromType: linkTemp.placeType,
                toType: data.fromType
            })
            await addDataToResource(resourceId!, "data.json", {
                fromId: data.fromId,
                toId: linkTemp.placeId,
                fromResourceId: data.fromResourceId,
                toResourceId: linkTemp.resourceId,
                fromType: data.fromType,
                toType: linkTemp.placeType
            })
        }
    }
}