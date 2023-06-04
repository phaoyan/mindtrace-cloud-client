import React, {useEffect, useState} from 'react';
import {useRecoilValue} from "recoil";
import {SelectedKnodeIdAtom} from "../../../../../recoil/home/Knode";
import {getExamResultsOfKnodeOffsprings, removeExamResult} from "../../../../../service/api/MasteryApi";
import {Col, Popconfirm, Row, Tabs, Timeline, TimelineItemProps} from "antd";
import {ExamResult} from "../../../../../service/data/mastery/ExamResult";
import {AnalyzerTypes} from "../../../../../service/data/mastery/ExamAnalysis";
import {BarChartOutlined, DeleteOutlined, FireOutlined} from "@ant-design/icons";
import {ChatGPTOutlined} from "../../../../utils/antd/icons/Icons";
import StatisticsAnalysisCard from "./StatisticsAnalysisCard/StatisticsAnalysisCard";
import HotspotAnalysisCard from "./HotspotAnalysisCard/HotspotAnalysisCard";
import GptAnalysisCard from "./GptAnalysisCard/GptAnalysisCard";
import utils from "../../../../../utils.module.css"

const ExamAnalysisPanel = () => {

    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [examResults, setExamResults] = useState<ExamResult[]>([])
    const [examResultTimelineItems, setExamResultTimelineItems] = useState<TimelineItemProps[]>([])
    useEffect(()=>{
        const effect = async ()=>{
            setExamResults(await getExamResultsOfKnodeOffsprings(selectedKnodeId))
        }; effect().then()
    }, [selectedKnodeId])
    useEffect(()=>{
        const items = examResults.map(result=>({children: <TimelineItem examResult={result} />}));
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
                                    children: <HotspotAnalysisCard examResult={props.examResult}/>
                                },
                                {
                                    key: AnalyzerTypes.GPT_ANALYSIS,
                                    label: (<div>
                                        <ChatGPTOutlined/>
                                        <span>GPT 分析</span>
                                    </div>),
                                    children: <GptAnalysisCard examResult={props.examResult}/>
                                }
                            ]}/>
                    </Col>
                </Row>
            </div>
        )
    }

    return (
        <div>
            <br/>
            <Timeline items={examResultTimelineItems}/>
            {examResults.length === 0 && <span className={utils.no_data}>暂无记录</span>}
        </div>
    );
};

export default ExamAnalysisPanel;