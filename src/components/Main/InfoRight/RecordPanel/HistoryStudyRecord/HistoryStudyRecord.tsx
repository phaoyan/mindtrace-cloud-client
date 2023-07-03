import React, {useEffect, useState} from 'react';
import {useRecoilState, useRecoilValue} from "recoil";
import {
    HistoryStudyRecordKeyAtom,
    StudyTracesAtom,
    useCalculateTitle, useKtreeTimeDistributionAntd,
    useRemoveTraceRecord, useTimeDistributionExpandedKeys
} from "./HistoryStudyRecordHooks";
import {
    getStudyTracesOfKnode,
    getTraceCoverages
} from "../../../../../service/api/TracingApi";
import {Breadcrumb, Calendar, Col, Divider, Pagination, Popconfirm, Row, Timeline, Tooltip, Tree} from "antd";
import {StudyTrace} from "../../../../../service/data/Tracing";
import {getChainStyleTitle} from "../../../../../service/api/KnodeApi";
import PlainLoading from "../../../../utils/general/PlainLoading";
import {breadcrumbTitle} from "../../../../../service/data/Knode";
import classes from "./HistoryStudyRecord.module.css"
import dayjs from "dayjs";
import {CalendarOutlined, DeleteOutlined, HistoryOutlined, PieChartOutlined} from "@ant-design/icons";
import utils from "../../../../../utils.module.css"
import {
    formatMillisecondsToHHMM,
    formatMillisecondsToHHMMSS,
    sameDay, sameMonth,
} from "../../../../../service/utils/TimeUtils";
import {CurrentStudyAtom} from "../CurrentStudyRecord/CurrentStudyRecordHooks";
import {SelectedKnodeIdAtom} from "../../../../../recoil/home/Knode";

const HistoryStudyRecord = () => {
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [studyTraces, setStudyTraces] = useRecoilState(StudyTracesAtom)
    const [studyTraceCurrentPage, setStudyTraceCurrentPage] = useState<number>(1)
    const studyTracePageSize = 3
    const [statisticDisplay, setStatisticDisplay] = useState<"calendar" | "data" | "history" | "distribution">("history")
    const [statisticDisplayKey, setStatisticDisplayKey] = useState<number>(0)
    const currentStudy = useRecoilValue(CurrentStudyAtom)
    const componentKey = useRecoilValue(HistoryStudyRecordKeyAtom)
    const timeDistribution = useKtreeTimeDistributionAntd()
    const timeDistributionExpandedKeys = useTimeDistributionExpandedKeys()

    useEffect(()=>{
        const effect = async ()=>{
            setStudyTraces((await getStudyTracesOfKnode(selectedKnodeId)).reverse())
        }; effect()
        //eslint-disable-next-line
    }, [selectedKnodeId])
    useEffect(()=>{
        setStatisticDisplayKey(statisticDisplayKey + 1)
        //eslint-disable-next-line
    }, [statisticDisplay])


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
                    <Tooltip title={"学习时间分布（时：分）"}>
                        <PieChartOutlined
                            className={utils.icon_button}
                            onClick={()=>setStatisticDisplay("distribution")}/>
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
                <div key={statisticDisplayKey + 1}>
                    <Timeline
                        items={studyTraces
                            .slice((studyTraceCurrentPage - 1) * studyTracePageSize, studyTraceCurrentPage * studyTracePageSize)
                            .map(trace=>({children: <StudyTraceRecord key={trace.id} trace={trace}/>}))}/>
                    <Pagination
                        onChange={(page)=>setStudyTraceCurrentPage(page)}
                        defaultCurrent={studyTraceCurrentPage}
                        pageSize={studyTracePageSize}
                        hideOnSinglePage={true}
                        total={studyTraces.length}/>
                </div>}{
                statisticDisplay === 'distribution' &&
                timeDistribution &&
                <div key={statisticDisplayKey + 2}>
                    <Tree
                        showLine={true}
                        treeData={[timeDistribution]}
                        expandedKeys={timeDistributionExpandedKeys}/>
                </div>
            }<br/>

        </div>
    );
};

const StudyTraceRecord = (props:{trace: StudyTrace})=>{

    const [coverages, setCoverages] = useState<number[]>([])
    const [relKnodeChainTitles, setRelKnodeChainTitles] = useState<{knodeId: number, title: string[]}[]>()
    const removeTraceRecord = useRemoveTraceRecord()
    const calculateTitle = useCalculateTitle()
    const [title, setTitle] = useState<string>("")
    useEffect(()=>{
        const effect = async ()=>{
            setCoverages(await getTraceCoverages(props.trace.id))
            setTitle(await calculateTitle(props.trace))
        }; effect()
        //eslint-disable-next-line
    }, [props.trace])
    useEffect(()=>{
        const effect = async ()=>{
            const temp = []
            for(let coverage of coverages)
                temp.push({knodeId: coverage, title: await getChainStyleTitle(coverage)})
            setRelKnodeChainTitles(temp)
        }; effect()
    }, [coverages])

    if(!props.trace || !relKnodeChainTitles) return <PlainLoading/>
    return (
        <div>
            <Row>
                <Col span={1}>
                    <Popconfirm
                        title={"确定要删除该学习记录？"}
                        showCancel={false}
                        onConfirm={()=>removeTraceRecord(props.trace.id)}>
                        <DeleteOutlined className={utils.icon_button_normal}/>
                    </Popconfirm>
                </Col>
                <Col span={6}>
                    <span className={classes.time_bar}>{dayjs(props.trace.startTime).format("YYYY-MM-DD HH:mm")}</span>
                </Col>
                <Col span={6} offset={9}>
                    <span className={classes.duration}>{formatMillisecondsToHHMMSS(props.trace.seconds * 1000)}</span>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <span className={classes.trace_title}>{title}</span>
                </Col>
            </Row>
            <Row>
                <Col span={1}>
                    <Divider type={"vertical"} style={{height:"100%"}}/>
                </Col>
                <Col span={22}>{
                    relKnodeChainTitles.map(data=><Breadcrumb items={breadcrumbTitle(data.title, true)} key={data.knodeId}/>)
                }</Col>
            </Row>
        </div>
    )
}

export default HistoryStudyRecord;