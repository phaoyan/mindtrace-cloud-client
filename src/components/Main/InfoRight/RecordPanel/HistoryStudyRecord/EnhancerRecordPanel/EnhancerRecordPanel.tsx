import React from 'react';
import {Col, Pagination, Row, Tooltip} from "antd";
import classes from "../HistoryStudyRecord.module.css";
import {CalendarOutlined, EditOutlined, FieldTimeOutlined} from "@ant-design/icons";
import {formatMillisecondsToHHMM} from "../../../../../../service/utils/TimeUtils";
import dayjs from "dayjs";
import EnhancerStudyRecord from "./EnhancerStudyRecord";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    EnhancerRecordPanelCurrentPageAtom,
    EnhancerRecordInfoListAtom,
    useInitEnhancerRecordData
} from "./EnhancerRecordPanelHooks";
import {EnhancerCard} from "../../../EnhancerPanel/EnhancerCard/EnhancerCard";
import EnhancerGroupCard from "../../../EnhancerPanel/EnhancerGroupCard/EnhancerGroupCard";
import {AccumulateDurationAtom} from "../HistoryStudyRecordHooks";
import {useInitStudyTraceData} from "../StudyTraceTimeline/StudyTraceTimelineHooks";

const EnhancerRecordPanel = () => {
    const [enhancerRecordInfoList, ] = useRecoilState(EnhancerRecordInfoListAtom)
    const accumulatedDuration = useRecoilValue(AccumulateDurationAtom)
    const [currentPage, setCurrentPage] = useRecoilState(EnhancerRecordPanelCurrentPageAtom)
    const pageSize = 10
    useInitEnhancerRecordData()
    useInitStudyTraceData()

    return (
        <div>{
            [...enhancerRecordInfoList]
                .sort((a, b) => b.duration - a.duration)
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map(info=>(
                    <div key={info.enhancerId || info.groupId}>
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
                            <Col span={6}>{
                                info.traces.length !==0 &&
                                <span className={classes.enhancer_distribution_info}>
                                    {formatMillisecondsToHHMM(accumulatedDuration[info.traces[info.traces.length-1].id] * 1000)}
                                    &nbsp;~&nbsp;
                                    {formatMillisecondsToHHMM(accumulatedDuration[info.traces[0].id] * 1000)}
                                </span>
                            }</Col>
                        </Row>
                        <Row>
                            <Col span={23} offset={1}>
                                {info.enhancerId && <EnhancerCard id={info.enhancerId} hideName={true} readonly={true}/>}
                                {info.groupId && <EnhancerGroupCard id={info.groupId} hideName={true} readonly={true}/>}
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