import React, {useEffect, useState} from 'react';
import {useRecoilState, useRecoilValue} from "recoil";
import {
    AccumulateDurationAtom,
    HistoryStudyRecordKeyAtom,
    StudyTracesAtom,
    useEnhancerTimeDistribution, useKtreeTimeDistributionAntd,
} from "./HistoryStudyRecordHooks";
import {
    getMilestonesBeneathKnode,
    getStudyTracesOfKnode, getTraceIdsInMilestones, setMilestoneKnodeId,
} from "../../../../../service/api/TracingApi";
import {Calendar, Col, Pagination, Row, Timeline, Tooltip, Tree} from "antd";
import classes from "./HistoryStudyRecord.module.css"
import dayjs from "dayjs";
import {
    BookOutlined,
    CalendarOutlined,
    EditOutlined,
    FieldTimeOutlined,
    HistoryOutlined, MonitorOutlined,
    PieChartOutlined, PlusOutlined, RiseOutlined, ScissorOutlined
} from "@ant-design/icons";
import utils from "../../../../../utils.module.css"
import {
    formatMillisecondsToHHMM,
    sameDay, sameMonth,
} from "../../../../../service/utils/TimeUtils";
import {CurrentStudyAtom} from "../CurrentStudyRecord/CurrentStudyRecordHooks";
import {SelectedKnodeIdAtom, SelectedKtreeSelector} from "../../../../../recoil/home/Knode";
import EnhancerStudyRecord from "./EnhancerStudyRecord";
import EnhancerTraceTimeline from "./EnhancerTraceTimeline/EnhancerTraceTimeline";
import MilestonePanel from "./MilestonePanel/MilestonePanel";
import {ReadonlyModeAtom} from "../../../Main/MainHooks";
import {
    MilestoneCardsSelector,
    MilestonesAtom, ScissoredMilestoneIdAtom,
    useAddMilestone
} from "./MilestonePanel/MilestonePanelHooks";
import {StudyTraceRecord} from "./StudyTraceRecord";


const HistoryStudyRecord = () => {
    const readonly = useRecoilValue(ReadonlyModeAtom)
    const [selectedKnodeId,] = useRecoilState(SelectedKnodeIdAtom)
    const selectedKtree = useRecoilValue(SelectedKtreeSelector)
    const [studyTraces, setStudyTraces] = useRecoilState(StudyTracesAtom)
    const [, setAccumulatedDuration] = useRecoilState(AccumulateDurationAtom)
    const [tracesAndMilestones, setTracesAndMilestones] = useState<any[]>([])
    const [studyTimePerDayCurrentMonth, setStudyTimePerDayCurrentMonth] = useState<string>()
    const [milestones, setMilestones] = useRecoilState(MilestonesAtom)
    const milestoneCards = useRecoilValue(MilestoneCardsSelector)
    const [scissoredMilestoneId, setScissoredMilestoneId] = useRecoilState(ScissoredMilestoneIdAtom)
    const [studyTraceCurrentPage, setStudyTraceCurrentPage] = useState<number>(1)
    const studyTracePageSize = 8
    const [statisticDisplay, setStatisticDisplay] = useState<
        "calendar" | "data" | "history" |
        "knode distribution" |
        "enhancer distribution" |
        "enhancer trace timeline" |
        "milestone">("history")
    const [statisticDisplayKey, setStatisticDisplayKey] = useState<number>(0)
    const currentStudy = useRecoilValue(CurrentStudyAtom)
    const [componentKey, setComponentKey] = useRecoilState(HistoryStudyRecordKeyAtom)
    const timeDistribution = useKtreeTimeDistributionAntd()
    const [timeDistributionExpandedKeys, setTimeDistributionExpandedKeys] = useState<number[]>([])
    const enhancerRecordInfoList = useEnhancerTimeDistribution()
    const addMilestone = useAddMilestone()


    useEffect(()=>{
        const effect = async ()=>{
            setMilestones(
                (await getMilestonesBeneathKnode(selectedKnodeId))
                .filter((e: any)=>e !== undefined && e !== null)
                .sort((e1: any, e2: any)=>dayjs(e2.time).diff(dayjs(e1.time))))
        }; effect().then()
        //eslint-disable-next-line
    }, [selectedKnodeId, componentKey])
    useEffect(()=>{

    }, [milestones])
    useEffect(()=>{
        if(!selectedKtree) return
        setTimeDistributionExpandedKeys([selectedKtree.knode.id, ...selectedKtree.branches.map(branch=>branch.knode.id)])
    }, [selectedKtree])
    useEffect(()=>{
        const effect = async ()=>{
            const traces = await getStudyTracesOfKnode(selectedKnodeId)
            traces.sort((a,b)=>-dayjs(b.startTime).diff(a.startTime))
            let cur = 0
            let temp = new Map()
            for(let i = 0; i < traces.length; i ++){
                cur += traces[i].seconds
                temp.set(traces[i].id, cur)
            }
            setStudyTraces(traces.reverse())
            setAccumulatedDuration(temp)
        }; effect().then()
        //eslint-disable-next-line
    }, [selectedKnodeId, currentStudy])
    useEffect(()=>{
        setStatisticDisplayKey(statisticDisplayKey + 1)
        //eslint-disable-next-line
    }, [statisticDisplay])
    useEffect(()=>{
        const tracesCurrentMonth = studyTraces.filter(trace=>sameMonth(dayjs(), dayjs(trace.startTime)))
        if(tracesCurrentMonth.length === 0){
            setStudyTimePerDayCurrentMonth("00:00")
            return
        }
        const totalDuration = tracesCurrentMonth
            .map(trace=>trace.seconds)
            .reduce((d1, d2) => d1 + d2);
        setStudyTimePerDayCurrentMonth(formatMillisecondsToHHMM(Math.round(totalDuration / dayjs().date()) * 1000))
    },[studyTraces])
    useEffect(()=>{
        const effect = async ()=>{
            const traceIdsInMilestone = new Set(await getTraceIdsInMilestones(studyTraces.map(trace=>trace.id)));
            setTracesAndMilestones([
                ...studyTraces
                    .filter(trace=>!traceIdsInMilestone.has(trace.id))
                    .map((trace)=>({
                        children: <StudyTraceRecord key={trace.id} trace={trace}/>,
                        time: trace.startTime})),
                ...milestoneCards
            ])
        }; effect().then()
        //eslint-disable-next-line
    }, [studyTraces, milestones])


    if(currentStudy) return <></>
    return (
        <div key={componentKey}>
            <Row>
                <Col span={2}>
                    <Tooltip title={"历史记录"}>
                        <HistoryOutlined
                            className={utils.icon_button}
                            onClick={()=>setStatisticDisplay("history")}/>
                    </Tooltip>
                </Col>
                <Col span={2}>
                    <Tooltip title={"学习日历"}>
                        <CalendarOutlined
                            className={utils.icon_button}
                            onClick={()=>setStatisticDisplay("calendar")}/>
                    </Tooltip>
                </Col>
                <Col span={2}>
                    <Tooltip title={"学习知识时间分布（时：分）"}>
                        <PieChartOutlined
                            className={utils.icon_button}
                            onClick={()=>setStatisticDisplay("knode distribution")}/>
                    </Tooltip>
                </Col>
                <Col span={2}>
                    <Tooltip title={"学习任务时间分布（时：分）"}>
                        <BookOutlined
                            className={utils.icon_button}
                            onClick={()=>setStatisticDisplay("enhancer distribution")}/>
                    </Tooltip>
                </Col>
                <Col span={2}>
                    <Tooltip title={"学习时间线（按笔记）"}>
                        <MonitorOutlined
                            className={utils.icon_button}
                            onClick={()=>setStatisticDisplay("enhancer trace timeline")}/>
                    </Tooltip>
                </Col>
                <Col span={2}>
                    <Tooltip title={"学习里程碑"}>
                        <RiseOutlined
                            className={utils.icon_button}
                            onClick={()=>setStatisticDisplay("milestone")}/>
                    </Tooltip>
                </Col>
            </Row>
            <br/>{
                statisticDisplay === "calendar" &&
                <div key={statisticDisplayKey}>
                    <Calendar
                        cellRender={(date, info)=>{
                        return info.type === "date" ?
                            (<div className={classes.date_cell_container}>
                                <span className={classes.date_cell}>{
                                    studyTraces.filter(trace=>sameDay(dayjs(trace.startTime), date)).length !== 0 &&
                                    formatMillisecondsToHHMM(
                                        studyTraces
                                            .filter(trace=>sameDay(dayjs(trace.startTime), date))
                                            .map(trace=>trace.seconds)
                                            .reduce((prev, cur) => prev + cur) * 1000,
                                        true)
                                }</span>
                            </div>) : info.type === "month" ?
                                (<div className={classes.date_cell_container}>
                                <span className={classes.date_cell}>{
                                    studyTraces.filter(trace=>sameMonth(dayjs(trace.startTime), date)).length !== 0 &&
                                    formatMillisecondsToHHMM(
                                        studyTraces
                                            .filter(trace=>sameMonth(dayjs(trace.startTime), date))
                                            .map(trace=>trace.seconds)
                                            .reduce((prev, cur) => prev + cur) * 1000,
                                        true)
                                }</span>
                            </div>) : <></>
                    }}/>
                </div>}{
                statisticDisplay === 'history'  &&
                    <div key={statisticDisplayKey + 1}>{
                    <Row>
                        <Col span={6} offset={1}>
                            <span className={classes.info_prompt}>当月日均学时</span>
                        </Col>
                        <Col span={6}>
                            <span className={classes.info_data}>{studyTimePerDayCurrentMonth}</span>
                        </Col>
                    </Row>}
                    <br/>{
                    !readonly &&
                    <Row className={`${classes.add_box}`}>
                        <Col span={1}>
                            <PlusOutlined
                                className={utils.icon_button}
                                onClick={()=>addMilestone()}/>
                        </Col>
                        <Col span={1}>{
                            scissoredMilestoneId &&
                            <Tooltip title={"粘贴里程碑到该知识点"}>
                                <ScissorOutlined
                                    className={utils.icon_button}
                                    onClick={async ()=>{
                                        await setMilestoneKnodeId(scissoredMilestoneId, selectedKnodeId)
                                        setComponentKey(componentKey + 1)
                                        setScissoredMilestoneId(undefined)
                                    }}/>
                            </Tooltip>
                        }</Col>
                        <Col span={4}>
                            <span>添加里程碑 . . . </span>
                        </Col>
                    </Row>
                    }<br/>
                    <Timeline
                        items={
                            tracesAndMilestones
                            .sort((a,b)=>dayjs(b.time).diff(a.time))
                            .slice((studyTraceCurrentPage - 1) * studyTracePageSize, studyTraceCurrentPage * studyTracePageSize)
                        }/>
                    <Pagination
                        onChange={(page)=>setStudyTraceCurrentPage(page)}
                        defaultCurrent={studyTraceCurrentPage}
                        pageSize={studyTracePageSize}
                        hideOnSinglePage={true}
                        total={tracesAndMilestones.length}/>
                </div>}{
                statisticDisplay === 'knode distribution' &&
                timeDistribution &&
                <div key={statisticDisplayKey + 2}>
                    <Tree
                        showLine={true}
                        treeData={[timeDistribution]}
                        expandedKeys={timeDistributionExpandedKeys}
                        onExpand={(expandedKeys: any) => setTimeDistributionExpandedKeys(expandedKeys)}/>
                </div>}{
                statisticDisplay === "enhancer distribution" &&
                enhancerRecordInfoList &&
                <div key={statisticDisplayKey + 3}>{
                    enhancerRecordInfoList
                        .sort((a,b)=>b.duration - a.duration)
                        .map(info=>(
                        <div key={info.enhancerId}>
                            <Row>
                                <Col span={8}>
                                    <span className={classes.enhancer_distribution_title}>{info.title}</span>
                                </Col>
                                <Col span={1}>
                                    <Tooltip title={"学习总时长（时：分）"}>
                                        <FieldTimeOutlined className={classes.enhancer_distribution_icon}/>
                                    </Tooltip>
                                </Col>
                                <Col span={3}>
                                    <span className={classes.enhancer_distribution_info}>{formatMillisecondsToHHMM(info.duration * 1000)}</span>
                                </Col>
                                <Col span={1}>
                                    <Tooltip title={"学习次数"}>
                                        <EditOutlined className={classes.enhancer_distribution_icon}/>
                                    </Tooltip>
                                </Col>
                                <Col span={2}>
                                    <span className={classes.enhancer_distribution_info}>{info.review}</span>
                                </Col>
                                <Col span={1}>
                                    <Tooltip title={"距上次学习间隔天数"}>
                                        <CalendarOutlined className={classes.enhancer_distribution_icon}/>
                                    </Tooltip>
                                </Col>
                                <Col span={2}>
                                    <span className={classes.enhancer_distribution_info}>
                                        {dayjs().diff(dayjs(info.traces[0].startTime),'day')}
                                    </span>
                                </Col>
                            </Row>
                            <br/>
                            <Row>
                                <Col span={22} offset={1}>
                                    <EnhancerStudyRecord info={info}/>
                                </Col>
                            </Row>
                        </div>
                    ))}
            </div>}{
            statisticDisplay === "enhancer trace timeline" &&
            <div key={statisticDisplayKey + 4}>
                <EnhancerTraceTimeline/>
            </div>}{
            statisticDisplay === "milestone" &&
            <div key={statisticDisplayKey + 5}>
                <MilestonePanel/>
            </div>
        }<br/>
        </div>
    );
};
export default HistoryStudyRecord;