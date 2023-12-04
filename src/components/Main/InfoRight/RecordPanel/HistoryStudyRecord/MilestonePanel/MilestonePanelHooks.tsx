import {atom, atomFamily, selector, useRecoilState, useRecoilValue} from "recoil";
import {SelectedKnodeIdAtom} from "../../../../../../recoil/home/Knode";
import {
    addMilestone,
    addResourceToMilestone,
    getMilestoneById,
    getResourcesFromMilestone,
    getStudyTracesInMilestone,
    removeMilestone,
    removeResourceFromMilestone,
    setMilestoneDescription
} from "../../../../../../service/api/TracingApi";
import React, {useEffect, useState} from "react";
import {Col, Dropdown, Input, Popconfirm, Row} from "antd";
import dayjs from "dayjs";
import {
    Resource,
    ResourcePlayer,
    useAddResourceDropdownItems
} from "../../../EnhancerPanel/EnhancerCard/EnhancerCardHooks";
import {CalendarOutlined, DeleteOutlined, MinusOutlined, PlusOutlined} from "@ant-design/icons";
import utils from "../../../../../../utils.module.css";
import classes from "./MilestonePanel.module.css"
import {ReadonlyModeAtom} from "../../../../Main/MainHooks";
import {StudyTrace} from "../../../../../../service/data/Tracing";
import {MilestoneCard} from "./MilestoneCard";

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

export const MilestoneTraceIdsAtom = atom<number[]>({
    key:"MilestoneCardTracesAtomFamily",
    default:[]
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

export const useAddMilestone = ()=>{
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [milestones, setMilestones] = useRecoilState(MilestonesAtom)
    return async ()=>{
        setMilestones([...milestones, await addMilestone(selectedKnodeId)])
    }
}