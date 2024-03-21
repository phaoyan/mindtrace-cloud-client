import React from 'react';
import {Col, Pagination, Row, Timeline} from "antd";
import classes from "../HistoryStudyRecord.module.css";
import {useRecoilState, useRecoilValue} from "recoil";
import {LoadedTracesAtom} from "../HistoryStudyRecordHooks";
import {
    StudyTimePerDayCurrentMonthAtom,
    StudyTraceCountAtom,
    StudyTraceTimelineCurrentPageAtom,
    StudyTraceTimelinePageSizeAtom,
    useInitStudyTraceData
} from "./StudyTraceTimelineHooks";
import {StudyTraceRecord} from "./StudyTraceRecord";
import {MilestoneCardsSelector, useAddMilestone, useInitMilestoneData} from "../MilestonePanel/MilestonePanelHooks";
import dayjs from "dayjs";
import {PlusOutlined} from "@ant-design/icons";
import utils from "../../../../../../utils.module.css";
import {ReadonlyModeAtom} from "../../../../Main/MainHooks";

const StudyTraceTimeline = () => {
    const readonly = useRecoilValue(ReadonlyModeAtom)
    const [studyTimePerDayCurrentMonth,] = useRecoilState(StudyTimePerDayCurrentMonthAtom)
    const [loadedTraces,] = useRecoilState(LoadedTracesAtom)
    const milestoneCards = useRecoilValue(MilestoneCardsSelector)
    const [currentPage, setCurrentPage] = useRecoilState(StudyTraceTimelineCurrentPageAtom)
    const [pageSize, ] = useRecoilState(StudyTraceTimelinePageSizeAtom)
    const [traceCount, ] = useRecoilState(StudyTraceCountAtom)
    const addMilestone = useAddMilestone()
    useInitStudyTraceData()
    useInitMilestoneData()

    return (
        <div>
            <Row>
                <Col span={6} offset={1}>
                    <span className={classes.info_prompt}>当月日均学时</span>
                </Col>
                <Col span={6}>
                    <span className={classes.info_data}>{studyTimePerDayCurrentMonth}</span>
                </Col>
            </Row>

            <br/>{
            !readonly &&
            <Row>
                <Col span={22} offset={1}>
                    <div className={`${classes.add_box}`}>
                        <PlusOutlined
                            className={utils.icon_button}
                            onClick={()=>addMilestone()}/>
                        &nbsp;&nbsp;
                        <span>添加里程碑 . . . </span>
                    </div>
                </Col>
            </Row>
            }<br/>
            <Timeline items={
                [
                ...loadedTraces
                    .filter(trace=>!trace.milestoneId)
                    .map((trace)=>({
                        children: <StudyTraceRecord key={trace.id} trace={trace}/>,
                        time: trace.startTime})),
                ...milestoneCards
                ]
                    .sort((a, b)=>-dayjs(a.time).diff(dayjs(b.time)))
                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
            }/>
            <Pagination
                onChange={(page)=>setCurrentPage(page)}
                current={currentPage}
                pageSize={pageSize}
                hideOnSinglePage={true}
                total={traceCount}/>
        </div>
    );
};

export default StudyTraceTimeline;