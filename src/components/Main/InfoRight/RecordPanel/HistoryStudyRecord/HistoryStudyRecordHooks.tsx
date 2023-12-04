import {atom, useRecoilState, useRecoilValue} from "recoil";
import {StudyTrace} from "../../../../../service/data/Tracing";
import {
    addMilestoneTraceRel,
    getStudyTraceEnhancerInfoUnderKnode,
    getStudyTraceKnodeInfo, getStudyTracesInMilestone,
    getTraceKnodeRels, removeMilestoneTraceRel,
    removeStudyTrace, updateStudyTrace
} from "../../../../../service/api/TracingApi";
import {getChainStyleTitle} from "../../../../../service/api/KnodeApi";
import {SelectedKnodeIdAtom, SelectedKtreeSelector} from "../../../../../recoil/home/Knode";
import React, {useEffect, useState} from "react";
import KnodeTitle from "../../../KnodeTitle/KnodeTitle";
import {Ktree} from "../../../../../service/data/Knode";
import {formatMillisecondsToHHMM} from "../../../../../service/utils/TimeUtils";
import classes from "./HistoryStudyRecord.module.css";
import {CalendarOutlined, EditOutlined, FieldTimeOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {Tooltip} from "antd";
import {getEnhancerById, getKnodesByEnhancerId} from "../../../../../service/api/EnhancerApi";
import {DEFAULT_DATE_TIME_PATTERN} from "../../../../../service/utils/constants";
import {MessageApiAtom} from "../../../../../recoil/utils/DocumentData";
import {CurrentTabAtom} from "../../InfoRightHooks";
import {
    MilestoneTraceIdsAtom,
    MilestoneTracesAtomFamily,
    SelectedMilestoneIdAtom,
    SelectedMilestoneTracesSelector
} from "./MilestonePanel/MilestonePanelHooks";

export const StudyTracesAtom = atom<StudyTrace[]>({
    key: "StudyTracesAtom",
    default: []
})

export const HistoryStudyRecordKeyAtom = atom<number>({
    key: "HistoryStudyRecordKeyAtom",
    default: 0
})

export const useRemoveTraceRecord = ()=>{
    const [studyTraces, setStudyTraces] = useRecoilState(StudyTracesAtom)
    return async (traceId: number)=>{
        await removeStudyTrace(traceId)
        setStudyTraces(studyTraces.filter(trace=>trace.id !== traceId))
    }
}

export const useCalculateTitle = ()=>{
    return async (trace: StudyTrace)=>{
        if(!trace) return ""
        if(trace.title) return trace.title
        const coverages = await getTraceKnodeRels(trace.id);
        if(coverages.length === 0) return ""
        const chainStyleTitle = await getChainStyleTitle(coverages[0]);
        if(chainStyleTitle.length === 0) return ""
        return chainStyleTitle[chainStyleTitle.length - 2]
    }
}

export const useJumpToEnhancer = ()=>{
    const [, setSelectedKnodeId] = useRecoilState(SelectedKnodeIdAtom)
    const [, setCurrentTab] = useRecoilState(CurrentTabAtom)
    const messageApi = useRecoilValue(MessageApiAtom)
    return async (enhancerId: number)=>{
        const knodes = await getKnodesByEnhancerId(enhancerId)
        if(knodes.length === 0){
            messageApi.error("找不到该笔记（或许已被删除）")
            return
        }
        setSelectedKnodeId(knodes[0].id)
        setCurrentTab("note")
    }
}

export interface KtreeTimeDistributionAntd{
    key: number,
    title: any,
    children: KtreeTimeDistributionAntd[]
}

export const useKtreeTimeDistributionAntd = ()=>{
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [timeDistributionAntd, setTimeDistributionAntd] = useState<KtreeTimeDistributionAntd>()
    const selectedKtree = useRecoilValue(SelectedKtreeSelector)
    useEffect(()=>{
        const effect = async ()=>{
            if(!selectedKtree) return
            const info = await getStudyTraceKnodeInfo(selectedKnodeId);
            const map: any = {}
            for(let item of info)
                map[item.knodeId] = item
            setTimeDistributionAntd(convertKtreeAntd([selectedKtree], map)[0])
        }; effect()
        //eslint-disable-next-line
    }, [selectedKnodeId])
    return timeDistributionAntd
}

const convertKtreeAntd = (ori: Ktree[], infoMap: any): KtreeTimeDistributionAntd[]=>{
    if (ori[0] == null) return []
    return ori.map(ktree => ({
        key: ktree.knode.id,
        title: (<div style={{display:"flex"}}>
            <KnodeTitle id={ktree?.knode.id!} hideOptions={true}/>
            <span className={classes.distribution_info}>{
                infoMap[ktree.knode.id].duration !== 0 && (
                <Tooltip title={"学习时长"}>
                    <FieldTimeOutlined style={{marginRight:"0.5em"}}/>
                    {formatMillisecondsToHHMM(infoMap[ktree.knode.id].duration*1000)}
                </Tooltip>)
            }</span>
            <span className={classes.distribution_info}>{
                infoMap[ktree.knode.id].review !== 0 && (
                <Tooltip title={"学习次数"}>
                    <EditOutlined style={{marginRight:"0.5em"}}/>
                    {infoMap[ktree.knode.id].review}
                </Tooltip>)
            }</span>
            <span className={classes.distribution_info}>{
                infoMap[ktree.knode.id].moments.length !== 0 && (
                <Tooltip title={"距离上次学习的天数"}>
                    <CalendarOutlined style={{marginRight:"0.5em"}}/>
                    {dayjs().diff(dayjs(infoMap[ktree.knode.id].moments[infoMap[ktree.knode.id].moments.length - 1]), "day")}
                </Tooltip>)
            }</span>
        </div>),
        children: convertKtreeAntd(ktree.branches, infoMap)
    }))
}

export const useEnhancerTimeDistribution = ()=>{
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [enhancerTimeDistribution, setEnhancerTimeDistribution] = useState<any[]>()
    useEffect(()=>{
        const effect = async ()=>{
            const resp = await getStudyTraceEnhancerInfoUnderKnode(selectedKnodeId)
            const data = []
            for(let info of resp)
                data.push({
                    ...info,
                    title: (await getEnhancerById(info.enhancerId)).title,
                    traces: info.traces.reverse()
                })
            data.sort((a, b)=>
                -dayjs(a.traces[0].startTime, DEFAULT_DATE_TIME_PATTERN)
                .diff(dayjs(b.traces[0].startTime, DEFAULT_DATE_TIME_PATTERN)))
            setEnhancerTimeDistribution(data)
        }; effect().then()
    }, [selectedKnodeId])
    return enhancerTimeDistribution
}

export const useAddMilestoneTraceRel = ()=>{
    const selectedMilestoneId = useRecoilValue(SelectedMilestoneIdAtom)
    const [traceIds, setTraceIds] = useRecoilState(MilestoneTraceIdsAtom)
    const [, setMilestoneTraces] = useRecoilState(SelectedMilestoneTracesSelector);
    return async (traceId: number)=>{
        if(!selectedMilestoneId) return
        await addMilestoneTraceRel(selectedMilestoneId, traceId)
        setMilestoneTraces(await getStudyTracesInMilestone(selectedMilestoneId))
        setTraceIds([...traceIds, traceId])
    }
}

export const useRemoveMilestoneTraceRel = (traceId: number, milestoneId?: number)=>{
    const [traces, setTraces] = useRecoilState(MilestoneTracesAtomFamily(milestoneId))
    const [traceIds, setTraceIds] = useRecoilState(MilestoneTraceIdsAtom)
    return async ()=>{
        await removeMilestoneTraceRel(milestoneId!, traceId)
        setTraces(traces.filter(trace=>trace.id !== traceId))
        setTraceIds(traceIds.filter(id=>id!==traceId))
    }
}