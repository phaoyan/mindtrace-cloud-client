import React, {Suspense, useEffect} from 'react';
import {Col, Row} from "antd";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {
    CurrentExamSessionAtom,
    ExamCurrentKnodeIdAtom, ExamCurrentQuizzesAtom
} from "../../../../../../recoil/home/ExamSession";
import utils from "../../../../../../utils.module.css"
import classes from "./HotspotExamMain.module.css"
import {examInteractWrapped} from "../../../../../../service/api/MasteryApi";
import {getResourceById} from "../../../../../../service/api/ResourceApi";
import {ResourcePlayer} from "../../../EnhancerPanel/EnhancerCard/EnhancerCardHooks"
import CrossAndCheck from "../utils/CrossAndCheck";
import DividerTimer from "../utils/DividerTimer";
import TitleAndOptions from "../utils/TitleAndOptions";
import FinishSessionPrompt from "../utils/FinishSessionPrompt";
import {useGetKnode} from "../../ExamConfigs/HotspotConfigs/HotspotConfigsHooks";
import {HotspotMainMsgAtom, HotspotStatisticsMsgAtom, useHandleRight, useHandleWrong} from "./HotspotExamMainHooks";


const HotspotExamMain = () => {

    const currentSession = useRecoilValue(CurrentExamSessionAtom)
    const [mainMsg, setMainMsg] = useRecoilState(HotspotMainMsgAtom)
    const [statisticsMsg, setStatisticsMsg] = useRecoilState(HotspotStatisticsMsgAtom)
    const [currentQuiz, setCurrentQuiz] = useRecoilState(ExamCurrentQuizzesAtom)
    const setExamCurrentKnodeId = useSetRecoilState(ExamCurrentKnodeIdAtom)
    const getKnode = useGetKnode()
    const handleRight = useHandleRight()
    const handleWrong = useHandleWrong()
    useEffect(()=>{
        const effect = async ()=>{
            if(!currentSession) return
            const mainResp = await examInteractWrapped(currentSession.id, {type:"main"})
            setMainMsg(JSON.parse(mainResp.message!))
            const statisticsResp = await examInteractWrapped(currentSession.id, {type:"statistics"})
            setStatisticsMsg(JSON.parse(statisticsResp.message!))
        }; effect()
        //eslint-disable-next-line
    }, [currentSession])
    useEffect(()=>{
        const effect = async ()=>{
            if(!mainMsg) return
            const temp = []
            for(let quizId of mainMsg.quizIds)
                temp.push(await getResourceById(quizId))
            setCurrentQuiz(temp)
            setExamCurrentKnodeId(mainMsg.knodeId)
        }; effect()
        //eslint-disable-next-line
    }, [mainMsg])



    if(!currentSession || !mainMsg || !statisticsMsg || !currentQuiz) return <></>
    if(!mainMsg?.knodeId) return <FinishSessionPrompt/>
    return (
        <Suspense fallback={<></>}>
            <div>
                {/*基本信息*/}
                <Row>
                    <Col span={8}>
                    <span className={classes.basic_info}>
                        总错误数：{statisticsMsg.mistakes.length} / {statisticsMsg.mistakes.length + statisticsMsg.corrects.length}
                    </span>
                    </Col>
                    <Col span={8} >
                    <span className={classes.basic_info}>
                        当前层错误数： {statisticsMsg.mistakeMap[statisticsMsg.layerId.toString()] | 0} / {JSON.parse(currentSession.exam.examStrategy).config.threshold}
                    </span>
                    </Col>
                    <Col span={8}>
                    <span className={classes.basic_info}>
                        当前层： {getKnode(statisticsMsg.layerId)!.title}
                    </span>
                    </Col>
                </Row>
                <DividerTimer startTime={currentSession.startTime} id={currentSession.id}/>
                <TitleAndOptions/>{
                currentQuiz.map(quiz=><ResourcePlayer key={quiz.id} resource={quiz}/>)
            }{
                currentQuiz.length === 0 &&
                <div className={classes.placeHolder}>
                    <span className={utils.no_data} style={{height:"20vh"}}>No Data</span>
                </div>
            }<CrossAndCheck check={handleRight} cross={handleWrong}/>
            </div>
        </Suspense>
    );
};

export default HotspotExamMain;