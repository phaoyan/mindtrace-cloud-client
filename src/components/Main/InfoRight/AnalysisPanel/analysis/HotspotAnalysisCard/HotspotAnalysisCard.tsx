import React, {useEffect, useState} from 'react';
import {AnalyzerTypes, ExamAnalysis} from "../../../../../../service/data/mastery/ExamAnalysis";
import {useSetRecoilState} from "recoil";
import {SelectedKnodeIdAtom} from "../../../../../../recoil/home/Knode";
import {CurrentTabAtom} from "../../../InfoRightHooks";
import {Breadcrumb, Col, Row} from "antd";
import {getExamAnalysis} from "../../../../../../service/api/MasteryApi";
import {breadcrumbTitle} from "../../../../../../service/data/Knode";
import {getChainStyleTitle} from "../../../../../../service/api/KnodeApi";
import classes from "./HotspotAnalysisCard.module.css"
import dayjs from "dayjs";
import utils from "../../../../../../utils.module.css"
import {FireFilled} from "../../../../../utils/antd/icons/Icons";

const HotspotAnalysisCard = (props:{resultId: number}) => {
    const [analysis, setAnalysis] = useState<ExamAnalysis>()
    const [chainStyleTitles, setChainStyleTitles] = useState<{knodeId: number, title: string[]}[]>([])
    const setSelectedKnodeId = useSetRecoilState(SelectedKnodeIdAtom)
    const setCurrentTab = useSetRecoilState(CurrentTabAtom)
    useEffect(()=>{
        const effect = async ()=>{
            setAnalysis(await getExamAnalysis(props.resultId, AnalyzerTypes.HOTSPOT_ANALYSIS))
        }; effect()
    },[props.resultId])
    useEffect(()=>{
        const effect = async ()=>{
            if(!analysis) return
            const knodeIds: any[] = JSON.parse(analysis.analysis)
            let temp = []
            for(let knodeId of knodeIds)
                temp.push({knodeId: knodeId, title: await getChainStyleTitle(knodeId)})
            setChainStyleTitles(temp)
        }; effect()
    }, [analysis])

    if(!analysis) return <></>
    return (
        <div>
            <span className={classes.time}>
                {dayjs(analysis?.result.startTime).format("YYYY-MM-DD")}
            </span>{
            chainStyleTitles.map((data)=>(
                <Row key={data.knodeId} className={classes.item}>
                    <Col span={1}>
                        <FireFilled
                            className={utils.icon_button_normal}
                            onClick={()=>{
                                setSelectedKnodeId(data.knodeId);
                                setCurrentTab("note")
                            }}/>
                    </Col>
                    <Col span={22}>
                        <div className={classes.title}>
                            <Breadcrumb items={breadcrumbTitle(data.title, true)} key={data.knodeId}/>
                        </div>
                    </Col>
                </Row>
            ))
        }</div>
    );
};

export default HotspotAnalysisCard;