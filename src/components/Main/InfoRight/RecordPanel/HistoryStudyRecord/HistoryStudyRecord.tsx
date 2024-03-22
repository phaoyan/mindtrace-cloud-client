import React, {useEffect, useState} from 'react';
import {useRecoilState} from "recoil";
import {
    HistoryStudyRecordKeyAtom, StatisticDisplayAtom,
} from "./HistoryStudyRecordHooks";
import {Col, Row, Tooltip} from "antd";
import {
    BookOutlined,
    CalendarOutlined,
    HistoryOutlined, MonitorOutlined,
    PieChartOutlined, RiseOutlined
} from "@ant-design/icons";
import utils from "../../../../../utils.module.css"
import EnhancerTraceTimeline from "./EnhancerTraceTimeline/EnhancerTraceTimeline";
import MilestonePanel from "./MilestonePanel/MilestonePanel";
import {useInitMilestoneData} from "./MilestonePanel/MilestonePanelHooks";
import StudyTraceTimeline from "./StudyTraceTimeline/StudyTraceTimeline";
import CalendarPanel from "./CalendarPanel/CalendarPanel";
import KnodeDistributionPanel from "./KnodeDistributionPanel/KnodeDistributionPanel";
import EnhancerRecordPanel from "./EnhancerRecordPanel/EnhancerRecordPanel";
import {useInitCalendarData} from "./CalendarPanel/CalendarPanelHooks";
import {useInitEnhancerRecordData} from "./EnhancerRecordPanel/EnhancerRecordPanelHooks";
import {useInitKnodeDistributionData} from "./KnodeDistributionPanel/KnodeDistributionPanelHooks";
import {useInitStudyTraceData} from "./StudyTraceTimeline/StudyTraceTimelineHooks";


const HistoryStudyRecord = () => {
    const [statisticDisplay, setStatisticDisplay] = useRecoilState(StatisticDisplayAtom)
    const [statisticDisplayKey, setStatisticDisplayKey] = useState<number>(0)
    const [componentKey, ] = useRecoilState(HistoryStudyRecordKeyAtom)

    useEffect(()=>{
        setStatisticDisplayKey(statisticDisplayKey + 1)
        //eslint-disable-next-line
    }, [statisticDisplay])
    useInitCalendarData()
    useInitEnhancerRecordData()
    useInitKnodeDistributionData()
    useInitMilestoneData()
    useInitStudyTraceData()

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
                    <Tooltip title={"学习里程碑"}>
                        <RiseOutlined
                            className={utils.icon_button}
                            onClick={()=>setStatisticDisplay("milestone")}/>
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

            </Row>
            <br/>{
                statisticDisplay === "calendar" &&
                <div key={statisticDisplayKey}>
                    <CalendarPanel/>
                </div>}{
                statisticDisplay === 'history'  &&
                <div key={statisticDisplayKey + 1}>
                    <StudyTraceTimeline/>
                </div>}{
                statisticDisplay === 'knode distribution' &&
                <div key={statisticDisplayKey + 2}>
                    <KnodeDistributionPanel/>
                </div>}{
                statisticDisplay === "enhancer distribution" &&
                <div key={statisticDisplayKey + 3}>
                    <EnhancerRecordPanel/>
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