import React, {Suspense} from 'react';
import {Col, Row} from "antd";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    CurrentExamSessionAtom,
    ExamCurrentQuizzesAtom
} from "../../../../../../recoil/home/ExamSession";
import utils from "../../../../../../utils.module.css"
import classes from "./HotspotExamMain.module.css"
import {ResourcePlayer} from "../../../EnhancerPanel/EnhancerCard/EnhancerCardHooks"
import CrossAndCheck from "../utils/CrossAndCheck";
import DividerTimer from "../utils/DividerTimer";
import TitleAndOptions from "../utils/TitleAndOptions";
import FinishSessionPrompt from "../utils/FinishSessionPrompt";
import {useGetKnode} from "../../ExamConfigs/HotspotConfigs/HotspotConfigsHooks";
import {
    ExamSessionMsgAtom,
} from "../utils/GeneralHooks";
import {
    useHandleRight,
    useHandleWrong,
    useInitKnodeAndQuizzes,
    useInitSessionMsgWithMainAndStatistics
} from "./HotspotExamMainHooks";


const HotspotExamMain = () => {

    const currentSession = useRecoilValue(CurrentExamSessionAtom)
    const [sessionMsg,] = useRecoilState(ExamSessionMsgAtom)
    const [currentQuiz,] = useRecoilState(ExamCurrentQuizzesAtom)
    const getKnode = useGetKnode()
    const handleRight = useHandleRight()
    const handleWrong = useHandleWrong()
    useInitSessionMsgWithMainAndStatistics()
    useInitKnodeAndQuizzes()

    if(!currentSession || !sessionMsg.main || !sessionMsg.statistics || !currentQuiz) return <></>
    if(!sessionMsg.main?.knodeId) return <FinishSessionPrompt/>
    return (
        <Suspense fallback={<></>}>
            <div>
                <Row>
                    <Col span={8}>
                    <span className={classes.basic_info}>
                        总错误数：{sessionMsg.statistics.mistakes.length} / {sessionMsg.statistics.mistakes.length + sessionMsg.statistics.corrects.length}
                    </span>
                    </Col>
                    <Col span={8} >
                    <span className={classes.basic_info}>
                        当前层错误数： {sessionMsg.statistics.mistakeMap[sessionMsg.statistics.layerId.toString()] | 0} / {JSON.parse(currentSession.exam.examStrategy).config.threshold}
                    </span>
                    </Col>
                    <Col span={8}>
                    <span className={classes.basic_info}>
                        当前层： {getKnode(sessionMsg.statistics.layerId)!.title}
                    </span>
                    </Col>
                </Row>
                <DividerTimer startTime={currentSession.startTime} id={currentSession.id}/>
                <TitleAndOptions/>{
                currentQuiz.map(quiz=><ResourcePlayer key={quiz.id} resource={quiz}/>)}{
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