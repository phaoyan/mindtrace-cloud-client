import React from 'react';
import {Col, Pagination, Row, Tooltip} from "antd";
import classes from "../HistoryStudyRecord.module.css";
import {CalendarOutlined, EditOutlined, FieldTimeOutlined} from "@ant-design/icons";
import {formatMillisecondsToHHMM} from "../../../../../../service/utils/TimeUtils";
import dayjs from "dayjs";
import EnhancerStudyRecord from "./EnhancerStudyRecord";
import {useRecoilState} from "recoil";
import {
    EnhancerRecordPanelCurrentPageAtom,
    EnhancerTimeDistributionAtom,
    useInitEnhancerRecordData
} from "./EnhancerRecordPanelHooks";

const EnhancerRecordPanel = () => {
    const [enhancerRecordInfoList, ] = useRecoilState(EnhancerTimeDistributionAtom)
    const [currentPage, setCurrentPage] = useRecoilState(EnhancerRecordPanelCurrentPageAtom)
    const pageSize = 10
    useInitEnhancerRecordData()

    return (
        <div>{
            enhancerRecordInfoList &&
            enhancerRecordInfoList
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
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
                ))
            }<Pagination
            onChange={(page)=>setCurrentPage(page)}
            current={currentPage}
            pageSize={pageSize}
            hideOnSinglePage={true}
            total={enhancerRecordInfoList.length}/>
        </div>
    );
};

export default EnhancerRecordPanel;