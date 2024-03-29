import {atom, atomFamily, selector, useRecoilState, useRecoilValue} from "recoil";
import {SelectedKnodeIdAtom} from "../../../../../../recoil/home/Knode";
import {
    addMilestone, getMilestonesBeneathKnode,
} from "../../../../../../service/api/TracingApi";
import React, {useEffect} from "react";
import {StudyTrace} from "../../../../../../service/data/Tracing";
import {MilestoneCard} from "./MilestoneCard";
import dayjs from "dayjs";

export interface Milestone{
    id: number
    knodeId: number
    userId: number
    description: string,
    time: string
}

export const MilestonesAtom = atom<Milestone[]>({
    key: "milestonesAtom",
    default: []
})

export const MilestoneCardsSelector = selector<any[]>({
    key: "MilestoneCardsSelector",
    get: ({get})=>{
        const milestones = get(MilestonesAtom);
        return milestones.map(milestone=>({
            children:<MilestoneCard milestoneId={milestone.id}/>,
            time: milestone.time
        }))
    }
})

export const MilestoneTracesAtomFamily = atomFamily<StudyTrace[], number | undefined>({
    key: "MilestoneCardTracesAtomFamily",
    default: []
})
export const SelectedMilestoneIdAtom = atom<number | undefined>({
    key: "SelectedMilestoneIdAtom",
    default: undefined
})

export const SelectedMilestoneTracesSelector = selector<StudyTrace[]>({
    key: "SelectedMilestoneTracesSelector",
    get: ({get})=> get(MilestoneTracesAtomFamily(get(SelectedMilestoneIdAtom))),
    set: ({get, set}, newValue)=>{
        set(MilestoneTracesAtomFamily(get(SelectedMilestoneIdAtom)), newValue)
    }
})

export const CopiedMilestoneIdAtom = atom<number | undefined>({
    key: "CopiedMilestoneIdAtom",
    default: undefined
})

export const ScissoredMilestoneIdAtom = atom<number | undefined>({
    key: "ScissoredMilestoneIdAtom",
    default: undefined
})

export const useAddMilestone = ()=>{
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [milestones, setMilestones] = useRecoilState(MilestonesAtom)
    return async ()=>{
        setMilestones([await addMilestone(selectedKnodeId), ...milestones])
    }
}

export const useInitMilestoneData = ()=>{
    const [selectedKnodeId,] = useRecoilState(SelectedKnodeIdAtom)
    const [, setMilestones] = useRecoilState(MilestonesAtom)
    useEffect(()=>{
        const effect = async ()=>{
            setMilestones(
                (await getMilestonesBeneathKnode(selectedKnodeId))
                    .filter((e: any)=>e !== undefined && e !== null)
                    .sort((e1: any, e2: any)=>dayjs(e2.time).diff(dayjs(e1.time))))
        }; effect().then()
        //eslint-disable-next-line
    }, [selectedKnodeId])
}