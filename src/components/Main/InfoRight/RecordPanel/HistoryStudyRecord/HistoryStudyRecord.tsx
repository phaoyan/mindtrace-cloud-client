import React, {useEffect, useState} from 'react';
import {useRecoilState, useRecoilValue} from "recoil";
import {
    HistoryStudyRecordKeyAtom,
    StudyTracesAtom,
    useCalculateTitle, useEnhancerTimeDistribution, useKtreeTimeDistributionAntd,
    useRemoveTraceRecord
} from "./HistoryStudyRecordHooks";
import {
    getStudyTracesOfKnode, getTraceEnhancerRels,
    getTraceKnodeRels
} from "../../../../../service/api/TracingApi";
import {Breadcrumb, Calendar, Col, Divider, Pagination, Popconfirm, Row, Timeline, Tooltip, Tree} from "antd";
import {StudyTrace} from "../../../../../service/data/Tracing";
import {getChainStyleTitle} from "../../../../../service/api/KnodeApi";
import PlainLoading from "../../../../utils/general/PlainLoading";
import {breadcrumbTitle} from "../../../../../service/data/Knode";
import classes from "./HistoryStudyRecord.module.css"
import dayjs from "dayjs";
import {
    BookOutlined,
    CalendarOutlined,
    DeleteOutlined, EditOutlined,
    FieldTimeOutlined,
    HistoryOutlined,
    PieChartOutlined
} from "@ant-design/icons";
import utils from "../../../../../utils.module.css"
import {
    formatMillisecondsToHHMM,
    formatMillisecondsToHHMMSS,
    sameDay, sameMonth,
} from "../../../../../service/utils/TimeUtils";
import {CurrentStudyAtom} from "../CurrentStudyRecord/CurrentStudyRecordHooks";
import {DelayedSelectedKnodeIdAtom, SelectedKtreeSelector} from "../../../../../recoil/home/Knode";
import {getEnhancerById} from "../../../../../service/api/EnhancerApi";
import EnhancerStudyRecord from "./EnhancerStudyRecord";


const HistoryStudyRecord = () => {
    const selectedKnodeId = useRecoilValue(DelayedSelectedKnodeIdAtom)
    const selectedKtree = useRecoilValue(SelectedKtreeSelector)
    const [studyTraces, setStudyTraces] = useRecoilState(StudyTracesAtom)
    const [studyTraceCurrentPage, setStudyTraceCurrentPage] = useState<number>(1)
    const studyTracePageSize = 3
    const [statisticDisplay, setStatisticDisplay] = useState<
        "calendar" | "data" | "history" |
        "knode distribution" |
        "enhancer distribution">("history")
    const [statisticDisplayKey, setStatisticDisplayKey] = useState<number>(0)
    const currentStudy = useRecoilValue(CurrentStudyAtom)
    const componentKey = useRecoilValue(HistoryStudyRecordKeyAtom)
    const timeDistribution = useKtreeTimeDistributionAntd()
    const [timeDistributionExpandedKeys, setTimeDistributionExpandedKeys] = useState<number[]>([])
    const enhancerTimeDistribution = useEnhancerTimeDistribution()

    useEffect(()=>{
        if(!selectedKtree) return
        setTimeDistributionExpandedKeys([selectedKtree.knode.id, ...selectedKtree.branches.map(branch=>branch.knode.id)])
    }, [selectedKtree])
    useEffect(()=>{
        const effect = async ()=>{
            setStudyTraces((await getStudyTracesOfKnode(selectedKnodeId)).reverse())
        }; effect()
        //eslint-disable-next-line
    }, [selectedKnodeId, currentStudy])
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
                statisticDisplay === 'knode distribution' &&
                timeDistribution &&
                <div key={statisticDisplayKey + 2}>
                    <Tree
                        showLine={true}
                        treeData={[timeDistribution]}
                        expandedKeys={timeDistributionExpandedKeys}
                        onExpand={(expandedKeys: any) => setTimeDistributionExpandedKeys(expandedKeys)}/>
                </div>}{
                statisticDisplay === "enhancer distribution" &&
                enhancerTimeDistribution &&
                <div key={statisticDisplayKey + 3}>{
                    enhancerTimeDistribution.map(info=>(
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
                                    <span className={classes.enhancer_distribution_info}>{dayjs().diff(dayjs(info.moments[info.moments.length-1]),'day')}</span>
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
                }</div>
            }<br/>
        </div>
    );
};

const StudyTraceRecord = (props:{trace: StudyTrace})=>{

    const [knodeRels, setKnodeRels] = useState<number[]>([])
    const [enhancerRels, setEnhancerRels] = useState<number[]>([])
    const [relKnodeChainTitles, setRelKnodeChainTitles] = useState<{knodeId: number, title: string[]}[]>([])
    const [relEnhancerTitles, setRelEnhancerTitles] = useState<{enhancerId: number, title: string}[]>([])
    const removeTraceRecord = useRemoveTraceRecord()
    const calculateTitle = useCalculateTitle()
    const [title, setTitle] = useState<string>("")
    useEffect(()=>{
        const effect = async ()=>{
            setKnodeRels(await getTraceKnodeRels(props.trace.id))
            setEnhancerRels(await getTraceEnhancerRels(props.trace.id))
            setTitle(await calculateTitle(props.trace))
        }; effect()
        //eslint-disable-next-line
    }, [props.trace])
    useEffect(()=>{
        const effect = async ()=>{
            const temp = []
            for(let coverage of knodeRels)
                temp.push({knodeId: coverage, title: await getChainStyleTitle(coverage)})
            setRelKnodeChainTitles(temp)
        }; effect()
    }, [knodeRels])
    useEffect(()=>{
        const effect = async ()=>{
            const temp = []
            for (let id of enhancerRels)
                temp.push({enhancerId: id, title: (await getEnhancerById(id)).title})
            setRelEnhancerTitles(temp)
        }; effect()
    }, [enhancerRels])

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
                <Col span={8}>
                    <span className={classes.trace_title}>{title}</span>
                </Col>
                <Col span={1}>{
                    relEnhancerTitles.length !== 0 &&
                    <FieldTimeOutlined style={{scale:"120%"}}/>
                }</Col>
                <Col span={15}>{
                    relEnhancerTitles.map(data=><span key={data.enhancerId} className={classes.enhancer_title}>{data.title}</span>)
                }</Col>
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