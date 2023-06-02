import React, {useEffect, useState} from 'react';
import {Breadcrumb, Col, Divider, Popconfirm, Row} from "antd";
import {useRecoilState, useRecoilValue} from "recoil";
import {CurrentExamSessionAtom, CurrentInteractBack1Selector} from "../../../../../recoil/home/ExamSession";
import utils from "../../../../../utils.module.css"
import classes from "./HotspotExamMain.module.css"
import {examInteract, finishExamSession, interruptExamSession} from "../../../../../service/api/MasteryApi";
import {ExamInteract, examInteractPrototype} from "../../../../../service/data/mastery/ExamInteract";
import {getResourceById} from "../../../../../service/api/ResourceApi";
import {Resource, ResourcePlayer} from "../../../../../service/data/Resource";
import {getChainStyleTitle, getKnodeById} from "../../../../../service/api/KnodeApi";
import {breadcrumbTitle, Knode} from "../../../../../service/data/Knode";
import {CheckOutlined, CloseOutlined, DeleteOutlined, FieldTimeOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {formatMillisecondsToHHMMSS} from "../../../../../service/utils/TimeUtils";

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

    const [currentSession, setCurrentSession] = useRecoilState(CurrentExamSessionAtom)
    const response = useRecoilValue(CurrentInteractBack1Selector)
    const [message, setMessage] = useState<ResponseData>()
    const [currentQuiz, setCurrentQuiz] = useState<Resource[]>([])
    const [layer, setLayer] = useState<Knode>()
    const [chainStyleTitle, setChainStyleTitle] = useState<string[]>()

    useEffect(()=>{
        response && setMessage(JSON.parse(response.message!))
    }, [response])
    useEffect(()=>{
        if(!message) return
        if(message.done) return
        const initCurrentQuiz = async ()=>{
            let tempQuiz: Resource[] = []
            for(let quizId of message.quizIds)
                tempQuiz.push(await getResourceById(quizId))
            setCurrentQuiz(tempQuiz)
        }; initCurrentQuiz()
        const initChainStyleTitle = async ()=>{
            setChainStyleTitle(await getChainStyleTitle(message.knodeId))
        }; initChainStyleTitle()
        const initLayer = async ()=>{
            setLayer(await getKnodeById(message.layerId))
        }; initLayer()
    }, [message])


    const updateCurrentSession = (req: ExamInteract, resp: ExamInteract)=>{
        currentSession && setCurrentSession({...currentSession, interacts: [...currentSession.interacts, req, resp]})
    }

    const handleInterrupt = async ()=>{
        if(!currentSession) return
        await interruptExamSession(currentSession.id)
        setCurrentSession(undefined)
    }

    const [dividerKey, setDividerKey] = useState<number>(0)
    useEffect(()=>{
        setInterval(()=>setDividerKey(dividerKey + 1), 1000)
    }, [dividerKey])
    const [displayTimer, setDisplayTimer] = useState(true)

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
    if(message?.done)
        return (
            <div className={classes.placeHolder}>
                <span
                    className={utils.text_button}
                    onClick={async ()=>{
                        if(!currentSession) return
                        await finishExamSession(currentSession.id)
                        setCurrentSession(undefined)
                    }}>
                    完成！
                </span>
            </div>
        )
    if(message)
        return (
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
                <Divider key={dividerKey}>
                    {
                        displayTimer ?
                        <span
                            className={classes.timer}
                            style={{cursor:"pointer"}}
                            onClick={()=>{setDisplayTimer(false)}}>
                            {formatMillisecondsToHHMMSS(dayjs().diff(currentSession.startTime))}
                        </span> :
                        <FieldTimeOutlined
                            className={utils.icon_button}
                            style={{color:"#666", padding:"0 1em"}}
                            onClick={()=>setDisplayTimer(true)}/>
                    }
                </Divider>
                {/*测试问卷主体*/}
                <Row>
                    <Col span={23}>
                        <Breadcrumb items={breadcrumbTitle(chainStyleTitle!, true)}/>
                    </Col>
                    <Col span={1}>
                        <Popconfirm
                            title="确定要放弃本次测试？"
                            onConfirm={handleInterrupt}
                            okText="Yes"
                            cancelText="No">
                            <DeleteOutlined className={utils.icon_button}/>
                        </Popconfirm>
                    </Col>
                </Row>
                {currentQuiz.map(quiz=><ResourcePlayer key={quiz.id} resource={quiz}/>)}
                {
                    currentQuiz.length === 0 &&
                    <div className={classes.placeHolder}>
                        <span className={utils.no_data} style={{height:"20vh"}}>No Data</span>
                    </div>
                }
                <Row>
                    <Col span={6}></Col>
                    <Col span={2}>
                        <CloseOutlined
                            className={utils.icon_button}
                            onClick={async ()=>{
                                const req = examInteractPrototype(currentSession.id, {
                                    layerId: message?.layerId,
                                    knodeId: message?.knodeId,
                                    quizIds: currentQuiz.map(quiz=>quiz.id),
                                    completion: false
                                })
                                updateCurrentSession(req, await examInteract(currentSession.id, req))
                            }}/>
                    </Col>
                    <Col span={8}></Col>
                    <Col span={2}>
                        <CheckOutlined
                            className={utils.icon_button}
                            onClick={async ()=>{
                                const req = examInteractPrototype(currentSession.id, {
                                    layerId: message?.layerId,
                                    knodeId: message?.knodeId,
                                    quizIds: currentQuiz.map(quiz=>quiz.id),
                                    completion: true
                                })
                                updateCurrentSession(req, await examInteract(currentSession.id, req))
                            }}/>
                    </Col>
                </Row>
            </div>
        );
    else return <></>
};

export default HotspotExamMain;