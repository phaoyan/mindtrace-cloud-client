import React, {useEffect, useState} from 'react';
import {useRecoilValue} from "recoil";
import {SelectedKnodeIdAtom} from "../../../../../recoil/home/Knode";
import {getExamResultsOfKnodeOffsprings, removeExamResult} from "../../../../../service/api/MasteryApi";
import {Col, Pagination, Popconfirm, Row, Tabs, Timeline, TimelineItemProps} from "antd";
import {ExamResult} from "../../../../../service/data/mastery/ExamResult";
import {AnalyzerTypes} from "../../../../../service/data/mastery/ExamAnalysis";
import {BarChartOutlined, DeleteOutlined, FireOutlined} from "@ant-design/icons";
import StatisticsAnalysisCard from "./StatisticsAnalysisCard/StatisticsAnalysisCard";
import HotspotAnalysisCard from "./HotspotAnalysisCard/HotspotAnalysisCard";
import utils from "../../../../../utils.module.css"
import dayjs from "dayjs";

const ExamAnalysisPanel = () => {

    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [examResults, setExamResults] = useState<ExamResult[]>([])
    const [examResultTimelineItems, setExamResultTimelineItems] = useState<TimelineItemProps[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const pageSize = 3
    useEffect(()=>{
        const effect = async ()=>{
            setExamResults(await getExamResultsOfKnodeOffsprings(selectedKnodeId))
        }; effect().then()
    }, [selectedKnodeId])
    useEffect(()=>{
        const items = examResults
            .sort((a,b)=>dayjs(b.startTime).diff(dayjs(a.startTime)))
            .map(result=>({children: <TimelineItem examResult={result} />}));
        setExamResultTimelineItems(items)
        //eslint-disable-next-line
    }, [examResults])

    const handleRemove = async (resultId: number)=>{
        await removeExamResult(resultId)
        setExamResults(examResults.filter(result=>result.id !== resultId))
    }

    const TimelineItem = (props:{examResult: ExamResult})=>{
        return (
            <div>
                <Row>
                    <Col span={24}>
                        <Tabs
                            defaultActiveKey={AnalyzerTypes.STATISTICS_ANALYSIS}
                            tabPosition={"top"}
                            size={"small"}
                            tabBarExtraContent={(
                                <Popconfirm
                                    title={"确定要删除此记录？"}
                                    onConfirm={async ()=> {
                                        await handleRemove(props.examResult.id)
                                    }}>
                                    <DeleteOutlined className={utils.icon_button_normal}/>
                                </Popconfirm>
                            )}
                            items={[
                                {
                                    key: AnalyzerTypes.STATISTICS_ANALYSIS,
                                    label: (<div>
                                        <BarChartOutlined/>
                                        <span>统计分析</span>
                                    </div>),
                                    children: <StatisticsAnalysisCard resultId={props.examResult.id}/>
                                },
                                {
                                    key: AnalyzerTypes.HOTSPOT_ANALYSIS,
                                    label: (<div>
                                        <FireOutlined />
                                        <span>热点分析</span>
                                    </div>),
                                    children: <HotspotAnalysisCard resultId={props.examResult.id}/>
                                }
                            ]}/>
                    </Col>
                </Row>
            </div>
        )
    }

    return (
        <div>
            <br/>{
            examResults.length === 0 ?
                <span className={utils.no_data}>暂无记录</span> :
                <>
                    <Timeline items={examResultTimelineItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)}/>
                    <Pagination
                        pageSize={pageSize}
                        hideOnSinglePage={true}
                        current={currentPage}
                        onChange={(page)=>setCurrentPage(page)}
                        total={examResultTimelineItems.length}/>
                </>
        }</div>
    );
};

export default ExamAnalysisPanel;