import React from 'react';
import {Col, Pagination, Row, Timeline} from "antd";
import classes from "../HistoryStudyRecord.module.css";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    StudyTimePerDayCurrentMonthAtom, StudyTraceGroupingAtom,
    StudyTraceTimelineCurrentPageAtom,
    StudyTraceTimelinePageSizeAtom,
    StudyTraceTimelineRecordsSelector,
    useInitStudyTraceData, useInitTraceGroupData
} from "./StudyTraceTimelineHooks";
import {FolderFilled, FolderOutlined} from "@ant-design/icons";
import utils from "../../../../../../utils.module.css";
import {ReadonlyModeAtom} from "../../../../Main/MainHooks";
import {FinishedOutlined} from "../../../../../utils/antd/icons/Icons";
import {unionTraces} from "../../../../../../service/api/TracingApi";

const StudyTraceTimeline = () => {
    const readonly = useRecoilValue(ReadonlyModeAtom)
    const [studyTimePerDayCurrentMonth,] = useRecoilState(StudyTimePerDayCurrentMonthAtom)
    const records = useRecoilValue(StudyTraceTimelineRecordsSelector)
    const [currentPage, setCurrentPage] = useRecoilState(StudyTraceTimelineCurrentPageAtom)
    const [pageSize, ] = useRecoilState(StudyTraceTimelinePageSizeAtom)
    const [grouping, setGrouping] = useRecoilState(StudyTraceGroupingAtom)
    useInitStudyTraceData()
    useInitTraceGroupData()
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
                        <>{
                            !grouping ?
                            <FolderOutlined
                                className={utils.icon_button}
                                onClick={()=>setGrouping([])}/>:
                            grouping.length === 0 ?
                            <FolderFilled
                                className={utils.icon_button}
                                onClick={()=>setGrouping(undefined) }/>:
                            <FinishedOutlined
                                className={utils.icon_button}
                                onClick={async ()=> {
                                    await unionTraces(grouping)
                                    setGrouping(undefined)
                                }}/>
                        }</>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <span>为学习记录分组 . . . </span>
                    </div>
                </Col>
            </Row>
            }<br/>
            <Timeline items={records.slice((currentPage - 1) * pageSize, currentPage * pageSize)}/>
            <Pagination
                onChange={(page)=>setCurrentPage(page)}
                current={currentPage}
                pageSize={pageSize}
                hideOnSinglePage={true}
                total={records.length}/>
        </div>
    );
};

export default StudyTraceTimeline;