import {StudyTrace} from "../../../../../../service/data/Tracing";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {useReadonly} from "../../../../Main/MainHooks";
import {SelectedKnodeIdAtom} from "../../../../../../recoil/home/Knode";
import {CurrentTabAtom} from "../../../InfoRightHooks";
import {
    CurrentStudyAtom,
    useAddEnhancerId,
    useAddKnodeId, useLastStudyInfo,
    useSetTitle
} from "../../CurrentStudyRecord/CurrentStudyRecordHooks";
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
    CopyOutlined,
    DeleteOutlined,
    EditOutlined, FolderFilled, FolderOutlined, RetweetOutlined,
    SearchOutlined,
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
    useCalculateTitle,
    useJumpToEnhancer,
    useRemoveTraceRecord
} from "./StudyTraceRecordHooks";
import EnhancerSearch from "./EnhancerSearch";
import {StudyTraceGroupingAtom, useRemoveTraceGroupRel} from "./StudyTraceTimelineHooks";

export const StudyTraceRecord = (props:{trace: StudyTrace, groupId?: number})=>{
    const readonly = useReadonly(props.trace.userId)
    const setSelectedKnodeId = useSetRecoilState(SelectedKnodeIdAtom)
    const setCurrentTab = useSetRecoilState(CurrentTabAtom)
    const [currentStudy, setCurrentStudy] = useRecoilState(CurrentStudyAtom)
    const accumulatedDuration = useRecoilValue(AccumulateDurationAtom)
    const [knodeRels, setKnodeRels] = useRecoilState(TraceKnodeRelAtomFamily(props.trace.id))
    const [enhancerRels, setEnhancerRels] = useRecoilState(TraceEnhancerRelAtomFamily(props.trace.id))
    const [relKnodeChainTitles, setRelKnodeChainTitles] = useRecoilState(RelKnodeChainTitlesFamily(props.trace.id))
    const [relEnhancerTitles, setRelEnhancerTitles] = useRecoilState(RelEnhancerTitlesFamily(props.trace.id))
    const [grouping, setGrouping] = useRecoilState(StudyTraceGroupingAtom)
    const removeTraceRecord = useRemoveTraceRecord()
    const calculateTitle = useCalculateTitle()
    const jumpToEnhancer = useJumpToEnhancer()
    const [title, setTitle] = useState<string>("")
    const addEnhancerIdToCurrentStudy = useAddEnhancerId()
    const addKnodeIdToCurrentStudy = useAddKnodeId()
    const setCurrentStudyTitle = useSetTitle()
    const lastStudyInfo = useLastStudyInfo()
    const removeTraceGroupRel = useRemoveTraceGroupRel()
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
                    !props.groupId && grouping &&
                    (!grouping.includes(props.trace.id) ?
                    <FolderOutlined
                        className={utils.icon_button_normal}
                        onClick={()=>setGrouping([...grouping, props.trace.id])}/>:
                    <FolderFilled
                        className={utils.icon_button_normal}
                        onClick={()=>setGrouping(grouping!.filter((traceId)=>traceId !== props.trace.id))}/>)}{
                    props.groupId &&
                    <Tooltip title={"将其从分组中移除"}>
                        <RetweetOutlined
                            className={utils.icon_button_normal}
                            onClick={()=>removeTraceGroupRel(props.trace.id, props.groupId!)}/>
                    </Tooltip>
                }</Col>
                <Col span={1}>{
                    dayjs().diff(dayjs(props.trace.endTime), "second") <= 3600 &&
                    <Tooltip title={"继续该次学习"}>
                        <EditOutlined
                            className={utils.icon_button_normal}
                            style={{position:"relative", top:"0.1em"}}
                            onClick={async ()=>setCurrentStudy(await restartCurrentStudy(props.trace.id))}/>
                    </Tooltip>
                }</Col>
                <Col span={9} offset={2}>
                    <span className={classes.duration}>
                        {formatMillisecondsToHHMMSS(props.trace.seconds * 1000)}
                        &nbsp;&nbsp;/&nbsp;&nbsp;
                        {props.trace.id in accumulatedDuration && formatMillisecondsToHHMM(accumulatedDuration[props.trace.id] * 1000)}
                    </span>
                </Col>
            </Row>
            <Row>
                <Col span={1}>{
                    currentStudy &&
                    <Tooltip
                        placement={"left"}
                        title={(
                        <CopyOutlined
                            className={utils.icon_button_normal}
                            onClick={()=>lastStudyInfo(props.trace)}/>
                    )}>
                        <EditOutlined
                            className={utils.icon_button_normal}
                            style={{position: "relative", top:"0.6em"}}
                            onClick={()=>setCurrentStudyTitle(props.trace.title)}/>
                    </Tooltip>
                }</Col>
                <Col span={11}>
                    <Input
                        value={title}
                        onChange={({target:{value}})=>setTitle(value)}
                        onBlur={()=>updateStudyTrace({id: props.trace.id, title: title})}
                        bordered={false}
                        className={classes.trace_title}
                        disabled={readonly}/>
                </Col>
                <Col span={1}>{
                    !readonly &&
                    <Popover
                        placement={"left"}
                        arrow={false}
                        content={<EnhancerSearch trace={props.trace}/>}>
                        <SearchOutlined className={utils.icon_button_normal} style={{scale:"120%"}}/>
                    </Popover>
                }</Col>
                <Col span={11}>{
                    relEnhancerTitles.map(data=> <span key={data.enhancerId} style={{marginRight:"1em"}}>
                        <Tooltip key={data.enhancerId} title={"点击跳转"}>
                            <span
                                className={classes.enhancer_title}
                                onClick={()=>jumpToEnhancer(data.enhancerId)}>
                                {data.title}
                            </span>
                        </Tooltip>{
                        currentStudy &&
                        <Tooltip title={"添加到学习记录"}>
                            <EditOutlined
                                className={utils.icon_button_normal}
                                onClick={()=>addEnhancerIdToCurrentStudy(data.enhancerId)}/>
                        </Tooltip>
                    }</span>)
                }</Col>
            </Row>
            <Row>
                <Col span={1}>
                    <Divider type={"vertical"} style={{height:"100%"}}/>
                </Col>
                <Col span={22}>{
                    relKnodeChainTitles
                        .filter(({title})=>title.length !== 0)
                        .map(data=>(
                        <div className={classes.knode_info} key={data.knodeId}>
                            <Breadcrumb items={breadcrumbTitle(data.title, true)}/>
                            <Tooltip title={"点击跳转"}>
                                <SwapOutlined
                                    className={utils.icon_button_normal}
                                    onClick={()=>{setSelectedKnodeId(data.knodeId); setCurrentTab("note")}}/>
                            </Tooltip>{
                            currentStudy &&
                            <Tooltip title={"添加到学习记录"}>
                                <EditOutlined
                                    className={utils.icon_button_normal}
                                    onClick={()=>addKnodeIdToCurrentStudy(data.knodeId)}/>
                            </Tooltip>
                        }</div>))
                }</Col>
            </Row>
        </div>
    )
}
