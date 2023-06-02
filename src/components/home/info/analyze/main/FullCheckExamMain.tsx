import React, {useEffect, useState} from 'react';
import {Breadcrumb, Col, Divider, Popconfirm, Row} from "antd";
import classes from "./FullCheckExamMain.module.css";
import {formatMillisecondsToHHMMSS} from "../../../../../service/utils/TimeUtils";
import dayjs from "dayjs";
import {CheckOutlined, CloseOutlined, DeleteOutlined, FieldTimeOutlined} from "@ant-design/icons";
import utils from "../../../../../utils.module.css";
import {useRecoilState} from "recoil";
import {CurrentExamSessionAtom} from "../../../../../recoil/home/ExamSession";
import {breadcrumbTitle} from "../../../../../service/data/Knode";
import {Resource, ResourcePlayer} from "../../../../../service/data/Resource";
import {
    examInteract,
    examInteractWrapped,
    finishExamSession,
    interruptExamSession
} from "../../../../../service/api/MasteryApi";
import {getChainStyleTitle} from "../../../../../service/api/KnodeApi";
import {getResourceById} from "../../../../../service/api/ResourceApi";
import {ExamInteract, examInteractPrototype} from "../../../../../service/data/mastery/ExamInteract";

interface ResponseMain{
    type: string
    knodeId: number
    quizIds: number[]
}
interface ResponseStatistics{
    type: string
    corrects: number[]
    mistakes: number[]
    total: number
}
const RESP_STATISTIC_DEFAULT: ResponseStatistics = {
    type: "statistics",
    corrects: [],
    mistakes: [],
    total: 0
}
const FullCheckExamMain = () => {

    const [currentSession, setCurrentSession] = useRecoilState(CurrentExamSessionAtom)
    const [statistics, setStatistics] = useState<ResponseStatistics>(RESP_STATISTIC_DEFAULT)
    const [currentKnodeId, setCurrentKnodeId] = useState<number>()
    const [chainStyleTitle, setChainStyleTitle] = useState<string[]>([])
    const [currentQuiz, setCurrentQuiz] = useState<Resource[]>([])
    const [done, setDone] = useState<boolean>(false)

    // 初始化
    useEffect(()=>{
        const effect = async ()=>{
            if(!currentSession) return
            const statisticsResp = await examInteractWrapped(currentSession.id, {type: "statistics"});
            setStatistics(JSON.parse(statisticsResp.message!))
            const mainResp = await examInteractWrapped(currentSession.id, {type: "main"});
            const mainMessage: ResponseMain = JSON.parse(mainResp.message!)
            mainMessage.knodeId && setCurrentKnodeId(mainMessage.knodeId)
            mainMessage.knodeId && setChainStyleTitle(await getChainStyleTitle(mainMessage.knodeId))
            const nextQuiz = []
            for(let quizId of mainMessage.quizIds || [])
                nextQuiz.push(await getResourceById(quizId))
            setCurrentQuiz(nextQuiz)
        }; effect()
        // eslint-disable-next-line
    }, [currentSession])
    useEffect(()=>{
        if(statistics.total !== 0 && statistics.mistakes.length + statistics.corrects.length === statistics.total)
            setDone(true)
    },[statistics])

    // timer
    const [dividerKey, setDividerKey] = useState<number>(0)
    useEffect(()=>{
        setInterval(()=>setDividerKey(dividerKey + 1), 1000)
    }, [dividerKey])
    const [displayTimer, setDisplayTimer] = useState(true)


    const updateCurrentSession = (req: ExamInteract, resp: ExamInteract)=>{
        currentSession && setCurrentSession({...currentSession, interacts: [...currentSession.interacts, req, resp]})
    }
    const handleInterrupt = async ()=>{
        if(!currentSession) return
        await interruptExamSession(currentSession.id)
        setCurrentSession(undefined)
    }

    if(!currentSession || !statistics || !currentQuiz) return <></>
    if(done) return (
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
    return (
        <div className={classes.container}>
            {/*基本信息*/}
            <Row>
                <Col span={4} offset={6}>
                        <span className={classes.basic_info}>
                            错误数：{statistics.mistakes?.length}
                        </span>
                </Col>
                <Col span={4} >
                        <span className={classes.basic_info}>
                            正确数：{statistics.corrects?.length}
                        </span>
                </Col>
                <Col span={4}>
                        <span className={classes.basic_info}>
                            总题数：{statistics.total}
                        </span>
                </Col>
            </Row>
            <Divider key={dividerKey}>
                {displayTimer ?
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
            {currentQuiz && currentQuiz.map(quiz=><ResourcePlayer key={quiz.id} resource={quiz}/>)}
            {
                currentQuiz && currentQuiz.length === 0 &&
                <div className={classes.placeHolder}>
                    <span className={utils.no_data} style={{height:"20vh"}}>No Data</span>
                </div>
            }

            <Row>
                <Col span={2} offset={6}>
                    <CloseOutlined
                        className={utils.icon_button}
                        onClick={async ()=>{
                            const req = examInteractPrototype(currentSession.id,{
                                type: "main",
                                knodeId: currentKnodeId,
                                quizIds: currentQuiz.map(quiz=>quiz.id),
                                completion: false
                            })
                            updateCurrentSession(req, await examInteract(currentSession.id, req))
                        }}/>
                </Col>
                <Col span={2} offset={8}>
                    <CheckOutlined
                        className={utils.icon_button}
                        onClick={async ()=>{
                            const req = examInteractPrototype(currentSession.id,{
                                type: "main",
                                knodeId: currentKnodeId,
                                quizIds: currentQuiz.map(quiz=>quiz.id),
                                completion: true
                            })
                            updateCurrentSession(req, await examInteract(currentSession.id, req))
                        }}/>
                </Col>
            </Row>
        </div>
    );
};

export default FullCheckExamMain;