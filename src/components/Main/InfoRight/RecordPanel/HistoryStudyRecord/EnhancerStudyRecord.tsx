import React, {useState} from 'react';
import {Col, Pagination, Row, Timeline, Tooltip} from "antd";
import classes from "./HistoryStudyRecord.module.css";
import {CalendarOutlined, FieldTimeOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {formatMillisecondsToHHMM} from "../../../../../service/utils/TimeUtils";

const EnhancerStudyRecord = (props: {info: any}) => {
    const records = Object.entries(props.info.momentsWithDuration)
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 8
    return (
        <div>
            <Timeline items={
                records
                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    .map((pair: any[])=>({children:
                            <div>
                                <Row>
                                    <Col span={8} className={classes.enhancer_distribution_item}>
                                        <Tooltip title={"学习起始日期"}>
                                            <CalendarOutlined/>
                                        </Tooltip>
                                        <span>{dayjs(pair[0]).format("YYYY-MM-DD")}</span>
                                    </Col>
                                    <Col span={4} className={classes.enhancer_distribution_item}>
                                        <Tooltip title={"学习时长（时：分）"}>
                                            <FieldTimeOutlined/>
                                        </Tooltip>
                                        <span>{formatMillisecondsToHHMM(pair[1]*1000)}</span>
                                    </Col>
                                </Row>
                            </div>
                    }))}/>
            <Pagination
                onChange={(page)=>{ setCurrentPage(page)}}
                defaultCurrent={currentPage}
                pageSize={pageSize}
                hideOnSinglePage={true}
                total={records.length}/>
        </div>
    );
};

export default EnhancerStudyRecord;