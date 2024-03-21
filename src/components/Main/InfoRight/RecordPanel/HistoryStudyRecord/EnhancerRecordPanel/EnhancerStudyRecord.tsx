import React, {useState} from 'react';
import {Col, Pagination, Row, Timeline, Tooltip} from "antd";
import classes from "../HistoryStudyRecord.module.css";
import {CalendarOutlined, FieldTimeOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {formatMillisecondsToHHMM} from "../../../../../../service/utils/TimeUtils";
import {StudyTrace} from "../../../../../../service/data/Tracing";

const EnhancerStudyRecord = (props: {info: any}) => {
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 8
    return (
        <div>
            <Timeline items={
                props.info.traces
                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    .map((trace: StudyTrace)=>({children:
                            <div>
                                <Row>
                                    <Col span={12} className={classes.enhancer_distribution_item}>
                                        <Tooltip title={"学习起始日期"}>
                                            <CalendarOutlined/>
                                        </Tooltip>
                                        <span>{dayjs(trace.startTime).format("YYYY-MM-DD")}</span>
                                    </Col>
                                    <Col span={8} className={classes.enhancer_distribution_item}>
                                        <Tooltip title={"学习时长（时：分）"}>
                                            <FieldTimeOutlined/>
                                        </Tooltip>
                                        <span>{formatMillisecondsToHHMM(trace.seconds * 1000)}</span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={23} offset={1}>
                                        <span className={classes.trace_title}>{trace.title}</span>
                                    </Col>
                                </Row>
                            </div>
                    }))}/>
            <Pagination
                onChange={(page)=>{ setCurrentPage(page)}}
                defaultCurrent={currentPage}
                pageSize={pageSize}
                hideOnSinglePage={true}
                total={props.info.traces.length}/>
        </div>
    );
};

export default EnhancerStudyRecord;