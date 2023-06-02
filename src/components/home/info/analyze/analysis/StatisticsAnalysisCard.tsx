import React, {useEffect, useState} from 'react';
import {getExamAnalysis} from "../../../../../service/api/MasteryApi";
import {AnalyzerTypes, ExamAnalysis} from "../../../../../service/data/mastery/ExamAnalysis";
import {Knode} from "../../../../../service/data/Knode";
import {Tree} from "antd";
import MdPreview from "../../../../utils/markdown/MdPreview";
import classes from "./StatisticsAnalysisCard.module.css"
import Gradient from "javascript-color-gradient";
import dayjs from "dayjs";
import {FireFilled} from "../../../../utils/antd/icons/Icons";


export interface TreeData {
    key: number,
    title: any,
    children: TreeData[]
}
const KnodeLabel = (props:{data: StatisticsAnalysisData})=>{

    const calculateColor = (completion: number, leaves: number): string=>{
        const gradientColor = new Gradient()
            .setColorGradient("#000000", "#ffffff")
            .setMidpoint(8)
            .getColors();
        return gradientColor[Math.ceil(completion / leaves * 7)]
    }
    if(!props.data) return <></>
    return (
        <div className={classes.label}>
            <MdPreview>{props.data.knode.title}</MdPreview>
            <span
                className={classes.ratio}
                style={{
                    color: calculateColor(props.data.completion, props.data.leaves)
                }}>
                {props.data.completion} / {props.data.leaves}
            </span>
            {props.data.completion === 0 && <FireFilled/>}
        </div>
    )
}
const arrayToTree = (array: StatisticsAnalysisData[]): TreeData | undefined => {
    if (array.length === 0) return
    console.log("ARRAY TO TREE", array)
    const map = new Map<number, TreeData>();
    let rootId: number = array[0].knode.id;
    for (const data of array) {
        const node: TreeData = {
            key: data.knode.id,
            title: <KnodeLabel data={data}/>,
            children: []
        }
        map.set(node.key, node);
    }
    for (const data of array) {
        if (data.knode.id !== rootId) {
            const parent = map.get(data.knode.stemId!);
            if (parent && parent.children)
                parent.children.push(map.get(data.knode.id)!);
        }
    }
    // 返回Map中根据rootId获取到的根节点
    return map.get(rootId);
}
interface StatisticsAnalysisData{
    knode: Knode,
    completion: number,
    leaves: number
}
const StatisticsAnalysisCard = (props:{resultId: number}) => {

    const [analysis, setAnalysis] = useState<ExamAnalysis>()
    const [treeData, setTreeData] = useState<TreeData>()
    useEffect(()=>{
        const effect = async ()=>{
            setAnalysis(await getExamAnalysis(props.resultId, AnalyzerTypes.STATISTICS_ANALYSIS))
        }; effect().then()
    },[props.resultId])
    useEffect(()=>{
        if(!analysis) return
        const dataList = JSON.parse(analysis.analysis) as StatisticsAnalysisData[];
        const treeDataTemp: TreeData | undefined = arrayToTree(dataList)
        treeDataTemp && setTreeData(treeDataTemp)
    },[analysis])

    if(!treeData) return <></>
    return (
        <div>
            <span className={classes.time}>
                {dayjs(analysis?.result.startTime).format("YYYY-MM-DD")}
            </span>
            <Tree
                showLine={true}
                treeData={[treeData]}
                autoExpandParent={true}
                defaultExpandAll={true}/>
        </div>
    );
};

export default StatisticsAnalysisCard;