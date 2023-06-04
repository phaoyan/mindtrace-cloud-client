import React, {Suspense, useEffect, useState} from 'react';
import {Col, Row} from "antd";
import classes from "./FullCheckExamMain.module.css";
import utils from "../../../../../../utils.module.css";
import {useRecoilState} from "recoil";
import {CurrentExamSessionAtom, ExamCurrentKnodeIdAtom} from "../../../../../../recoil/home/ExamSession";
import {Resource, ResourcePlayer} from "../../../EnhancerPanel/EnhancerCard/EnhancerCardHooks"
import {
    examInteract,
    examInteractWrapped,
} from "../../../../../../service/api/MasteryApi";
import {getResourceById} from "../../../../../../service/api/ResourceApi";
import {examInteractPrototype} from "../../../../../../service/data/mastery/ExamInteract";
import CrossAndCheck from "../utils/CrossAndCheck";
import DividerTimer from "../utils/DividerTimer";
import FinishSessionPrompt from "../utils/FinishSessionPrompt";
import TitleAndOptions from "../utils/TitleAndOptions";
import {useUpdateCurrentSession} from "../utils/GeneralHooks";

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

    const [currentSession,] = useRecoilState(CurrentExamSessionAtom)
    const [statistics, setStatistics] = useState<ResponseStatistics>(RESP_STATISTIC_DEFAULT)
    const [currentKnodeId, setCurrentKnodeId] = useRecoilState(ExamCurrentKnodeIdAtom)
    const [currentQuiz, setCurrentQuiz] = useState<Resource[]>([])
    const [done, setDone] = useState<boolean>(false)
    const updateCurrentSession = useUpdateCurrentSession()

    // 初始化
    useEffect(()=>{
        const effect = async ()=>{
            if(!currentSession) return
            const statisticsResp = await examInteractWrapped(currentSession.id, {type: "statistics"});
            setStatistics(JSON.parse(statisticsResp.message!))
            const mainResp = await examInteractWrapped(currentSession.id, {type: "main"});
            const mainMessage: ResponseMain = JSON.parse(mainResp.message!)
            mainMessage.knodeId && setCurrentKnodeId(mainMessage.knodeId)
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


    if(!currentSession || !statistics || !currentQuiz) return <></>
    if(done) return <FinishSessionPrompt/>
    return (
        <Suspense fallback={<></>}>
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
                <DividerTimer startTime={currentSession.startTime} id={currentSession.id}/>
                {/*测试问卷主体*/}
                <TitleAndOptions/>
                {currentQuiz && currentQuiz.map(quiz=><ResourcePlayer key={quiz.id} resource={quiz}/>)}{
                    currentQuiz && currentQuiz.length === 0 &&
                    <div className={classes.placeHolder}>
                        <span className={utils.no_data} style={{height:"20vh"}}>No Data</span>
                    </div>
                }<CrossAndCheck
                    check={async ()=>{
                        const req = examInteractPrototype(currentSession.id,{
                            type: "main",
                            knodeId: currentKnodeId,
                            quizIds: currentQuiz.map(quiz=>quiz.id),
                            completion: true
                        })
                        updateCurrentSession(req, await examInteract(currentSession.id, req))
                    }}
                    cross={async ()=>{
                        const req = examInteractPrototype(currentSession.id,{
                            type: "main",
                            knodeId: currentKnodeId,
                            quizIds: currentQuiz.map(quiz=>quiz.id),
                            completion: false
                        })
                        updateCurrentSession(req, await examInteract(currentSession.id, req))
                    }}/>
            </div>
        </Suspense>
    );
};

export default FullCheckExamMain;