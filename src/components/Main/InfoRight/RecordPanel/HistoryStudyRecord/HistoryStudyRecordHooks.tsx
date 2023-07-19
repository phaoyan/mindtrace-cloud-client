import {atom, useRecoilState, useRecoilValue} from "recoil";
import {StudyTrace} from "../../../../../service/data/Tracing";
import {
    getStudyTraceKnodeInfo,
    getTraceKnodeRels,
    removeStudyTrace
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

export const useTimeDistributionExpandedKeys = ()=>{
    const selectedKtree = useRecoilValue(SelectedKtreeSelector)
    if(!selectedKtree) return []
    return [selectedKtree.knode.id, ...selectedKtree.branches.map(branch=>branch.knode.id)]
}