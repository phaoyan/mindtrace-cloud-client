import React, {Suspense, useEffect, useState} from 'react';
import {Col, Row} from "antd";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    CurrentExamSessionAtom,
    CurrentInteractBack1Selector,
    ExamCurrentKnodeIdAtom
} from "../../../../../../recoil/home/ExamSession";
import utils from "../../../../../../utils.module.css"
import classes from "./HotspotExamMain.module.css"
import {examInteract} from "../../../../../../service/api/MasteryApi";
import {examInteractPrototype} from "../../../../../../service/data/mastery/ExamInteract";
import {getResourceById} from "../../../../../../service/api/ResourceApi";
import {Resource, ResourcePlayer} from "../../../EnhancerPanel/EnhancerCard/EnhancerCardHooks"
import {getKnodeById} from "../../../../../../service/api/KnodeApi";
import {Knode} from "../../../../../../service/data/Knode";
import CrossAndCheck from "../utils/CrossAndCheck";
import DividerTimer from "../utils/DividerTimer";
import TitleAndOptions from "../utils/TitleAndOptions";
import FinishSessionPrompt from "../utils/FinishSessionPrompt";
import {useUpdateCurrentSession} from "../utils/GeneralHooks";

interface ResponseData {
    layerId: number,
    knodeId: number,
    quizIds: number[],
    currentLayerMistakes: number,
    totalMistakes: number,
    done: boolean,
    visited: number[]
}
const HotspotExamMain = () => {

    const [currentSession,] = useRecoilState(CurrentExamSessionAtom)
    const response = useRecoilValue(CurrentInteractBack1Selector)
    const [message, setMessage] = useState<ResponseData>()
    const [currentQuiz, setCurrentQuiz] = useState<Resource[]>([])
    const [layer, setLayer] = useState<Knode>()
    const [, setExamCurrentKnodeId] = useRecoilState(ExamCurrentKnodeIdAtom)
    const updateCurrentSession = useUpdateCurrentSession()

    useEffect(()=>{
        response && setMessage(JSON.parse(response.message!))
    }, [response])
    useEffect(()=>{
        if(!message) return
        if(message.done) return
        const effect = async ()=>{
            let tempQuiz: Resource[] = []
            for(let quizId of message.quizIds)
                tempQuiz.push(await getResourceById(quizId))
            setCurrentQuiz(tempQuiz)
            setExamCurrentKnodeId(message.knodeId)
            setLayer(await getKnodeById(message.layerId))
        }; effect()
        //eslint-disable-next-line
    }, [message])


    if(!currentSession) return <></>
    if(!response)
        return (
            <div className={classes.placeHolder}>
                <span
                    className={utils.text_button}
                    onClick={async ()=>updateCurrentSession({},await examInteract(currentSession.id, examInteractPrototype(currentSession.id, {})))}>
                    开始答题
                </span>
            </div>
        )
    if(message?.done) return <FinishSessionPrompt/>
    if(message)
        return (
            <Suspense fallback={<></>}>
                <div>
                    {/*基本信息*/}
                    <Row>
                        <Col span={8}>
                        <span className={classes.basic_info}>
                            总错误数：{message.totalMistakes} / {Math.round(currentSession.interacts.length / 2)}
                        </span>
                        </Col>
                        <Col span={8} >
                        <span className={classes.basic_info}>
                            当前层错误数： {message.currentLayerMistakes} / {JSON.parse(currentSession.exam.examStrategy).config.threshold}
                        </span>
                        </Col>
                        <Col span={8}>
                        <span className={classes.basic_info}>
                            当前层： {layer?.title}
                        </span>
                        </Col>
                    </Row>
                    <DividerTimer startTime={currentSession.startTime} id={currentSession.id}/>
                    <TitleAndOptions/>
                    {currentQuiz.map(quiz=><ResourcePlayer key={quiz.id} resource={quiz}/>)}{
                        currentQuiz.length === 0 &&
                        <div className={classes.placeHolder}>
                            <span className={utils.no_data} style={{height:"20vh"}}>No Data</span>
                        </div>
                    }<CrossAndCheck
                        check={async ()=>{
                            const req = examInteractPrototype(currentSession.id, {
                                layerId: message?.layerId,
                                knodeId: message?.knodeId,
                                quizIds: currentQuiz.map(quiz=>quiz.id),
                                completion: true
                            })
                            updateCurrentSession(req, await examInteract(currentSession.id, req))
                        }}
                        cross={async ()=>{
                            const req = examInteractPrototype(currentSession.id, {
                                layerId: message?.layerId,
                                knodeId: message?.knodeId,
                                quizIds: currentQuiz.map(quiz=>quiz.id),
                                completion: false
                            })
                            updateCurrentSession(req, await examInteract(currentSession.id, req))
                        }}/>
                </div>
            </Suspense>
        );
    else return <></>
};

export default HotspotExamMain;