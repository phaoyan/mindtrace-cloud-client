import {atom, useRecoilState, useRecoilValue} from "recoil";
import {SelectedKnodeIdAtom, SelectedKtreeSelector} from "../../../../../../recoil/home/Knode";
import React, {useEffect,} from "react";
import {getStudyTraceKnodeInfo} from "../../../../../../service/api/TracingApi";
import {Ktree} from "../../../../../../service/data/Knode";
import KnodeTitle from "../../../../KnodeTitle/KnodeTitle";
import classes from "../HistoryStudyRecord.module.css";
import {Tooltip} from "antd";
import {CalendarOutlined, EditOutlined, FieldTimeOutlined} from "@ant-design/icons";
import {formatMillisecondsToHHMM} from "../../../../../../service/utils/TimeUtils";
import dayjs from "dayjs";

export interface KtreeTimeDistributionAntd{
    key: number,
    title: any,
    children: KtreeTimeDistributionAntd[]
}

export const TimeDistributionAntdAtom = atom<KtreeTimeDistributionAntd>({
    key: "TimeDistributionAntdAtom",
    default: undefined
})

export const useInitKnodeDistributionData = ()=>{
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const selectedKtree = useRecoilValue(SelectedKtreeSelector)
    const [, setTimeDistributionAntd] = useRecoilState(TimeDistributionAntdAtom)
    useEffect(()=>{
        const effect = async ()=>{
            if(!selectedKtree) return
            const info = await getStudyTraceKnodeInfo(selectedKnodeId);
            const map: any = {}
            for(let item of info)
                map[item.knodeId] = item
            setTimeDistributionAntd(convertKtreeAntd([selectedKtree], map)[0])
        }; effect().then()
        //eslint-disable-next-line
    }, [selectedKnodeId])
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
