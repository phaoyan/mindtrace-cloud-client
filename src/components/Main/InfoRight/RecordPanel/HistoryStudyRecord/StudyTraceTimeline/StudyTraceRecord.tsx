import {StudyTrace} from "../../../../../../service/data/Tracing";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {ReadonlyModeAtom} from "../../../../Main/MainHooks";
import {SelectedKnodeIdAtom} from "../../../../../../recoil/home/Knode";
import {CurrentTabAtom} from "../../../InfoRightHooks";
import {CurrentStudyAtom} from "../../CurrentStudyRecord/CurrentStudyRecordHooks";
import {
    SelectedMilestoneIdAtom
} from "../MilestonePanel/MilestonePanelHooks";
import React, {useEffect, useState} from "react";
import {
    AccumulateDurationAtom,
} from "../HistoryStudyRecordHooks";
import {
    getTraceEnhancerRels,
    getTraceKnodeRels,
    restartCurrentStudy,
    updateStudyTrace
} from "../../../../../../service/api/TracingApi";
import {getChainStyleTitle} from "../../../../../../service/api/KnodeApi";
import {getEnhancerById} from "../../../../../../service/api/EnhancerApi";
import PlainLoading from "../../../../../utils/general/PlainLoading";
import {Breadcrumb, Col, Divider, Input, Popconfirm, Popover, Row, Tooltip} from "antd";
import {
    CalendarOutlined,
    DeleteOutlined,
    EditOutlined,
    RetweetOutlined,
    SwapOutlined
} from "@ant-design/icons";
import utils from "../../../../../../utils.module.css";
import classes from "../HistoryStudyRecord.module.css";
import dayjs from "dayjs";
import {formatMillisecondsToHHMM, formatMillisecondsToHHMMSS} from "../../../../../../service/utils/TimeUtils";
import {breadcrumbTitle} from "../../../../../../service/data/Knode";
import {
    RelEnhancerTitlesFamily,
    RelKnodeChainTitlesFamily,
    TraceEnhancerRelAtomFamily,
    TraceKnodeRelAtomFamily,
    useAddMilestoneTraceRel,
    useCalculateTitle,
    useJumpToEnhancer,
    useRemoveMilestoneTraceRel,
    useRemoveTraceRecord
} from "./StudyTraceRecordHooks";
import EnhancerSearch from "./EnhancerSearch";

export const StudyTraceRecord = (props:{trace: StudyTrace})=>{
    const readonly = useRecoilValue(ReadonlyModeAtom)
    const setSelectedKnodeId = useSetRecoilState(SelectedKnodeIdAtom)
    const setCurrentTab = useSetRecoilState(CurrentTabAtom)
    const [, setCurrentStudy] = useRecoilState(CurrentStudyAtom)
    const [selectedMilestoneId,] = useRecoilState(SelectedMilestoneIdAtom)
    const accumulatedDuration = useRecoilValue(AccumulateDurationAtom)
    const [knodeRels, setKnodeRels] = useRecoilState(TraceKnodeRelAtomFamily(props.trace.id))
    const [enhancerRels, setEnhancerRels] = useRecoilState(TraceEnhancerRelAtomFamily(props.trace.id))
    const [relKnodeChainTitles, setRelKnodeChainTitles] = useRecoilState(RelKnodeChainTitlesFamily(props.trace.id))
    const [relEnhancerTitles, setRelEnhancerTitles] = useRecoilState(RelEnhancerTitlesFamily(props.trace.id))
    const removeTraceRecord = useRemoveTraceRecord()
    const calculateTitle = useCalculateTitle()
    const jumpToEnhancer = useJumpToEnhancer()
    const addMilestoneTraceRel = useAddMilestoneTraceRel();
    const removeMilestoneTraceRel = useRemoveMilestoneTraceRel(props.trace.id, props.trace.milestoneId)
    const [title, setTitle] = useState<string>("")
    useEffect(()=>{
        const effect = async ()=>{
            setKnodeRels(await getTraceKnodeRels(props.trace.id))
            setEnhancerRels(await getTraceEnhancerRels(props.trace.id))
            setTitle(await calculateTitle(props.trace))
        }; effect().then()
        //eslint-disable-next-line
    }, [props.trace])
    useEffect(()=>{
        const effect = async ()=>{
            const temp = []
            for(let coverage of knodeRels)
                temp.push({knodeId: coverage, title: await getChainStyleTitle(coverage)})
            setRelKnodeChainTitles(temp)
        }; effect().then()
        //eslint-disable-next-line
    }, [knodeRels])
    useEffect(()=>{
        const effect = async ()=>{
            const temp = []
            for (let id of enhancerRels)
                temp.push({enhancerId: id, title: (await getEnhancerById(id)).title})
            setRelEnhancerTitles(temp)
        }; effect().then()
        //eslint-disable-next-line
    }, [enhancerRels])

    if(!props.trace || !relKnodeChainTitles) return <PlainLoading/>
    return (
        <div>
            <Row>
                <Col span={1}>{
                    !readonly &&
                    <Popconfirm
                        title={"确定要删除该学习记录？"}
                        showCancel={false}
                        onConfirm={()=>removeTraceRecord(props.trace.id)}>
                        <DeleteOutlined className={utils.icon_button_normal} style={{position:"relative", top:"0.1em"}}/>
                    </Popconfirm>
                }</Col>
                <Col span={6}>
                    <span className={classes.time_bar}>{dayjs(props.trace.startTime).format("YYYY-MM-DD HH:mm")}</span>
                </Col>
                <Col span={1}>{
                    dayjs().diff(dayjs(props.trace.endTime), "second") <= 3600 &&
                    <Tooltip title={"继续该次学习"}>
                        <EditOutlined
                            className={utils.icon_button_normal}
                            style={{position:"relative", top:"0.1em"}}
                            onClick={async ()=>setCurrentStudy(await restartCurrentStudy(props.trace.id))}/>
                    </Tooltip>
                }</Col>
                <Col span={1}>
                    <Tooltip title={"将该学习记录绑定到里程碑上"}>{
                        selectedMilestoneId &&
                        !props.trace.milestoneId &&
                        <CalendarOutlined
                            className={utils.icon_button_normal}
                            onClick={()=>addMilestoneTraceRel(props.trace.id)}/>
                    }</Tooltip>{
                    props.trace.milestoneId &&
                    <Tooltip title={"将该学习记录从里程碑上移除"}>
                        <RetweetOutlined
                            className={utils.icon_button_normal}
                            onClick={()=>removeMilestoneTraceRel()}/>
                    </Tooltip>
                }</Col>
                <Col span={9} offset={3}>
                    <span className={classes.duration}>
                        {formatMillisecondsToHHMMSS(props.trace.seconds * 1000)}
                        &nbsp;&nbsp;/&nbsp;&nbsp;
                        {props.trace.id in accumulatedDuration && formatMillisecondsToHHMM(accumulatedDuration[props.trace.id] * 1000)}
                    </span>
                </Col>
            </Row>
            <Row>
                <Col span={12}>
                    <Input
                        value={title}
                        onChange={({target:{value}})=>setTitle(value)}
                        onBlur={()=>updateStudyTrace({id: props.trace.id, title: title})}
                        bordered={false}
                        className={classes.trace_title}
                        disabled={readonly}/>
                </Col>
                <Col span={1}>{
                    relEnhancerTitles.length !== 0 &&
                    <Popover
                        placement={"left"}
                        arrow={false}
                        content={<EnhancerSearch trace={props.trace}/>}>
                        <EditOutlined className={utils.icon_button_normal} style={{scale:"120%"}}/>
                    </Popover>
                }</Col>
                <Col span={11}>{
                    relEnhancerTitles.map(data=>
                        <Tooltip key={data.enhancerId} title={"点击跳转"}>
                            <span
                                className={classes.enhancer_title}
                                onClick={()=>jumpToEnhancer(data.enhancerId)}>
                                {data.title}
                            </span>
                        </Tooltip>)
                }</Col>
            </Row>
            <Row>
                <Col span={1}>
                    <Divider type={"vertical"} style={{height:"100%"}}/>
                </Col>
                <Col span={22}>{
                    relKnodeChainTitles.map(data=>(
                        <div className={classes.knode_info} key={data.knodeId}>
                            <Breadcrumb items={breadcrumbTitle(data.title, true)}/>
                            <Tooltip title={"点击跳转"}>
                                <SwapOutlined
                                    className={utils.icon_button_normal}
                                    onClick={()=>{setSelectedKnodeId(data.knodeId); setCurrentTab("note")}}/>
                            </Tooltip>
                        </div>))
                }</Col>
            </Row>
        </div>
    )
}
