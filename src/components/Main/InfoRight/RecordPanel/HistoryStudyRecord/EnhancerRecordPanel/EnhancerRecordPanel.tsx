import React, {useEffect, useState} from 'react';
import {Col, Pagination, Row, Tooltip} from "antd";
import classes from "../HistoryStudyRecord.module.css";
import {EditOutlined, FieldTimeOutlined} from "@ant-design/icons";
import {formatMillisecondsToHHMM} from "../../../../../../service/utils/TimeUtils";
import EnhancerStudyRecord from "./EnhancerStudyRecord";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    EnhancerRecordPanelCurrentPageAtom,
    EnhancerRecordInfoListAtom,
    EnhancerRecordPanelOrderAtom,
    useSortRecords,
    EnhancerRecordMinDurationAtom,
    StudyTraceEnhancerInfo, useInitEnhancerRecordData
} from "./EnhancerRecordPanelHooks";
import {EnhancerCard} from "../../../EnhancerPanel/EnhancerCard/EnhancerCard";
import EnhancerGroupCard from "../../../EnhancerPanel/EnhancerGroupCard/EnhancerGroupCard";
import {AccumulateDurationAtom} from "../HistoryStudyRecordHooks";
import {useInitStudyTraceData} from "../StudyTraceTimeline/StudyTraceTimelineHooks";

const EnhancerRecordPanel = () => {
    const [enhancerRecordInfoList, ] = useRecoilState(EnhancerRecordInfoListAtom)
    const accumulatedDuration = useRecoilValue(AccumulateDurationAtom)
    const [currentPage, setCurrentPage] = useRecoilState(EnhancerRecordPanelCurrentPageAtom)
    const [order, ] = useRecoilState(EnhancerRecordPanelOrderAtom)
    const [minDuration, setMinDuration] = useRecoilState(EnhancerRecordMinDurationAtom)
    const [filteredEnhancerRecordInfoList, setFilteredEnhancerRecordInfoList] = useState<StudyTraceEnhancerInfo[]>([])
    const pageSize = 10
    const sortRecords = useSortRecords()
    useInitStudyTraceData()
    useInitEnhancerRecordData()
    useEffect(()=>{
        setFilteredEnhancerRecordInfoList(enhancerRecordInfoList.filter((info)=>info.duration >= minDuration))
    }, [enhancerRecordInfoList, minDuration])

    return (
        <div>
            <div className={classes.min_duration_selection}>
                <span>最小时长：</span>
                <span onClick={()=>setMinDuration(0)}>0h</span>
                <span onClick={()=>setMinDuration(3600)}>1h</span>
                <span onClick={()=>setMinDuration(3600 * 3)}>3h</span>
                <span onClick={()=>setMinDuration(3600 * 10)}>10h</span>
                <span onClick={()=>setMinDuration(3600 * 30)}>30h</span>
                <span onClick={()=>setMinDuration(3600 * 50)}>50h</span>
                <span onClick={()=>setMinDuration(3600 * 100)}>100h</span>
                <span onClick={()=>setMinDuration(3600 * 500)}>500h</span>
            </div>{
            sortRecords([...filteredEnhancerRecordInfoList], order)
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
                            </Col>
                            <Col span={2}>
                            </Col>
                            <Col span={6}>{
                                info.traceIds.length !==0 &&
                                <span className={classes.enhancer_distribution_info}>
                                    {formatMillisecondsToHHMM(accumulatedDuration[info.traceIds[info.traceIds.length-1]] * 1000)}
                                    &nbsp;~&nbsp;
                                    {formatMillisecondsToHHMM(accumulatedDuration[info.traceIds[0]] * 1000)}
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
            total={filteredEnhancerRecordInfoList.length}/>
        </div>
    );
};

export default EnhancerRecordPanel;