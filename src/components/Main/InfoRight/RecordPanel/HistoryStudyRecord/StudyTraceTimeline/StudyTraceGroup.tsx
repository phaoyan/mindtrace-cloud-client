import React, {useEffect, useState} from 'react';
import {TraceGroup} from "../../../../../../service/data/Tracing";
import {Col, Input, Pagination, Popconfirm, Row, Timeline} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import classes from "../HistoryStudyRecord.module.css";
import dayjs from "dayjs";
import {useRecoilState, useRecoilValue} from "recoil";
import {GroupTraceMappingAtom, StudyTraceGroupingAtom, TraceGroupsAtom} from "./StudyTraceTimelineHooks";
import {
    removeTraceGroup,
    setTraceGroupTitle,
    unionTracesToGroup
} from "../../../../../../service/api/TracingApi";
import {useReadonly} from "../../../../Main/MainHooks";
import utils from "../../../../../../utils.module.css"
import {AccumulateDurationAtom, HistoryStudyRecordKeyAtom} from "../HistoryStudyRecordHooks";
import {FinishedOutlined} from "../../../../../utils/antd/icons/Icons";
import {formatMillisecondsToHHMM, formatMillisecondsToHHMMSS} from "../../../../../../service/utils/TimeUtils";
import {sum} from "lodash";

const StudyTraceGroup = (props: {group: TraceGroup, time: string}) => {
    const readonly = useReadonly(props.group.userId)
    const [mapping, ] = useRecoilState(GroupTraceMappingAtom)
    const [, setTraceGroups] = useRecoilState(TraceGroupsAtom)
    const [duration, setDuration] = useState(0)
    const [accDuration, setAccDuration] = useState(0)
    const [title, setTitle] = useState<string>("")
    const [extend, setExtend] = useState(false)
    const [, setComponentKey] = useRecoilState(HistoryStudyRecordKeyAtom)
    const [grouping, setGrouping] = useRecoilState(StudyTraceGroupingAtom)
    const accumulateDuration = useRecoilValue(AccumulateDurationAtom)
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 8

    useEffect(()=>{
        const duration = sum(mapping[props.group.id].map(record=>record.data.seconds))
        setDuration(duration)
        const lastTraceId = mapping[props.group.id][mapping[props.group.id].length-1].data.id
        lastTraceId in accumulateDuration &&
        setAccDuration(accumulateDuration[lastTraceId])
        //eslint-disable-next-line
    }, [mapping, accumulateDuration, currentPage])
    useEffect(()=>{
        setTitle(props.group.title)
    }, [props.group])
    return (
        <div>
            <Row>
                <Col span={1}>{
                    !readonly &&
                    <Popconfirm
                        title={"确定删除该分组？"}
                        showCancel={false}
                        onConfirm={async ()=> {
                            await removeTraceGroup(props.group.id)
                            setComponentKey(key => key + 1)
                        }}>
                        <DeleteOutlined className={utils.icon_button_normal}/>
                    </Popconfirm>
                }</Col>
                <Col span={6}>
                    <span className={classes.time_bar}>{dayjs(props.time).format("YYYY-MM-DD HH:mm")}</span>
                </Col>
                <Col span={1}>{
                    grouping && grouping.length !== 0 &&
                    <FinishedOutlined
                        className={utils.icon_button}
                        onClick={async ()=>{
                            await unionTracesToGroup(grouping, props.group.id)
                            setGrouping(undefined)
                        }}/>
                }</Col>
                <Col span={9} offset={3}>
                    <span className={classes.duration}>
                        {formatMillisecondsToHHMMSS(duration * 1000)}
                        &nbsp;&nbsp;/&nbsp;&nbsp;
                        {formatMillisecondsToHHMM(accDuration * 1000)}
                    </span>
                </Col>
            </Row>
            <Row>
                <Col span={20} offset={1}>
                    <Input
                        value={title}
                        onChange={({target:{value}})=>setTitle(value)}
                        onBlur={async ()=> {
                            await setTraceGroupTitle(props.group.id, title)
                            setTraceGroups(groups=>groups.map(group=>group.id===props.group.id ? {...group, title: title} : group))
                        }}
                        bordered={false}
                        className={classes.trace_group_title}
                        placeholder={". . . "}
                        disabled={readonly}/>
                </Col>
            </Row>
            <Row>
                <Col span={24}>{
                    extend &&
                    <>
                        <Timeline items={mapping[props.group.id].slice((currentPage - 1) * pageSize, currentPage * pageSize)}/>
                        <Pagination
                            onChange={(page)=>setCurrentPage(page)}
                            current={currentPage}
                            pageSize={pageSize}
                            hideOnSinglePage={true}
                            total={mapping[props.group.id].length}/>
                    </>}{
                    extend ?
                    <span className={`${classes.extend_prompt} ${utils.icon_button_normal}`} onClick={()=>setExtend(false)}>点击收回</span>:
                    <span className={`${classes.extend_prompt} ${utils.icon_button_normal}`} onClick={()=>setExtend(true)}>点击展开</span>
                }</Col>
            </Row>
        </div>
    );
};

export default StudyTraceGroup;