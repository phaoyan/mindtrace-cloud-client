import React, {Suspense} from 'react';
import {Col, Row, Tooltip} from "antd";
import classes from "./HeuristicExamMain.module.css";
import DividerTimer from "../utils/DividerTimer";
import TitleAndOptions from "../utils/TitleAndOptions";
import {ResourcePlayer} from "../../../EnhancerPanel/EnhancerCard/EnhancerCardHooks";
import utils from "../../../../../../utils.module.css";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    CurrentExamSessionAtom,
    ExamCurrentQuizzesAtom
} from "../../../../../../recoil/home/ExamSession";
import {useGetKnode} from "../../ExamConfigs/HotspotConfigs/HotspotConfigsHooks";
import {
    useHandleLayerDown,
    useHandleLayerRight,
    useHandleLayerUp,
} from "./HeuristicExamMainHooks";
import CrossAndCheck from "../utils/CrossAndCheck";
import {
    DownOutlined,
    RightOutlined,
    UpOutlined
} from "@ant-design/icons";
import FinishSessionPrompt from "../utils/FinishSessionPrompt";
import {
    ExamSessionMsgAtom,
} from "../utils/GeneralHooks";
import {
    useHandleRight,
    useHandleWrong, useInitKnodeAndQuizzes,
    useInitSessionMsgWithMainAndStatistics
} from "../HotspotExamMain/HotspotExamMainHooks";

const HeuristicExamMain = () => {

    const currentSession = useRecoilValue(CurrentExamSessionAtom)
    const [sessionMsg, ] = useRecoilState(ExamSessionMsgAtom)
    const [currentQuiz, ] = useRecoilState(ExamCurrentQuizzesAtom)
    const getKnode = useGetKnode()
    const handleRight = useHandleRight()
    const handleWrong = useHandleWrong()
    const handleLayerUp = useHandleLayerUp()
    const handleLayerDown = useHandleLayerDown()
    const handleLayerRight = useHandleLayerRight()
    useInitSessionMsgWithMainAndStatistics()
    useInitKnodeAndQuizzes()

    if(!currentSession || !sessionMsg.main || !sessionMsg.statistics || !currentQuiz) return <></>
    if(!sessionMsg.main.knodeId) return <FinishSessionPrompt/>
    return (
        <Suspense fallback={<></>}>
            <div>
                <Row>
                    <Col span={8}>
                    <span className={classes.basic_info}>
                        正误比：{sessionMsg.statistics.corrects.length} : {sessionMsg.statistics.mistakes.length}
                    </span>
                    </Col>
                    <Col span={8} >
                    <span className={classes.basic_info}>
                        当前层正误比： {sessionMsg.statistics.currentCorrects.length} : {sessionMsg.statistics.currentMistakes.length}
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
                }<Row>
                    <Col span={18}>
                        <CrossAndCheck check={handleRight} cross={handleWrong}/>
                    </Col>
                    <Col span={2}>
                        <Tooltip title={"当前层上移"} placement={"right"}>
                            <UpOutlined
                                className={utils.icon_button}
                                onClick={handleLayerUp}/>
                        </Tooltip>
                    </Col>
                    <Col span={2}>
                        <Tooltip title={"当前层下移"} placement={"right"}>
                            <DownOutlined
                                className={utils.icon_button}
                                onClick={handleLayerDown}/>
                        </Tooltip>
                    </Col>
                    <Col span={2}>
                        <Tooltip title={"当前层平移"} placement={"right"}>
                            <RightOutlined
                                className={utils.icon_button}
                                onClick={handleLayerRight}/>
                        </Tooltip>
                    </Col>
                </Row>
            </div>
        </Suspense>
    );
};

export default HeuristicExamMain;