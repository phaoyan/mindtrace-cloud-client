import {atom, useRecoilState,} from "recoil";
import {SelectedKnodeIdAtom} from "../../../../../../recoil/home/Knode";
import {CurrentTabAtom} from "../../../InfoRightHooks";
import {getMilestoneById} from "../../../../../../service/api/TracingApi";
import {StatisticDisplayAtom} from "../../../RecordPanel/HistoryStudyRecord/HistoryStudyRecordHooks";

export const NoteLinkAtom = atom<{resourceId: number, placeId: number, placeType: "enhancer" | "milestone"} | undefined>({
    key: "NoteLinkAtom",
    default: undefined
})

export const useJumpToMilestone = ()=>{
    const [, setSelectedKnodeId] = useRecoilState(SelectedKnodeIdAtom)
    const [, setCurrentTab] = useRecoilState(CurrentTabAtom)
    const [, setStatisticDisplay] = useRecoilState(StatisticDisplayAtom);
    return async (milestoneId: number)=>{
        const milestone = await getMilestoneById(milestoneId);
        setSelectedKnodeId(milestone.knodeId)
        setCurrentTab("record")
        setStatisticDisplay("milestone")
    }
}