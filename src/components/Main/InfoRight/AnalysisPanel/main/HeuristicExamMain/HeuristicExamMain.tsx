import React, {Suspense, useEffect} from 'react';
import {Col, Row, Tooltip} from "antd";
import classes from "./HeuristicExamMain.module.css";
import DividerTimer from "../utils/DividerTimer";
import TitleAndOptions from "../utils/TitleAndOptions";
import {ResourcePlayer} from "../../../EnhancerPanel/EnhancerCard/EnhancerCardHooks";
import utils from "../../../../../../utils.module.css";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {
    CurrentExamSessionAtom,
    ExamCurrentKnodeIdAtom,
    ExamCurrentQuizzesAtom
} from "../../../../../../recoil/home/ExamSession";
import {useGetKnode} from "../../ExamConfigs/HotspotConfigs/HotspotConfigsHooks";
import {examInteractWrapped} from "../../../../../../service/api/MasteryApi";
import {getResourceById} from "../../../../../../service/api/ResourceApi";
import {
    HeuristicMainMsgAtom,
    HeuristicStatisticsMsgAtom, useHandleLayerDown, useHandleLayerRight, useHandleLayerUp,
    useHandleRight,
    useHandleWrong
} from "./HeuristicExamMainHooks";
import CrossAndCheck from "../utils/CrossAndCheck";
import {
    DownOutlined,
    RightOutlined,
    UpOutlined
} from "@ant-design/icons";
import FinishSessionPrompt from "../utils/FinishSessionPrompt";

const HeuristicExamMain = () => {

    const currentSession = useRecoilValue(CurrentExamSessionAtom)
    const [mainMsg, setMainMsg] = useRecoilState(HeuristicMainMsgAtom)
    const [statisticsMsg, setStatisticsMsg] = useRecoilState(HeuristicStatisticsMsgAtom)
    const [currentQuiz, setCurrentQuiz] = useRecoilState(ExamCurrentQuizzesAtom)
    const setExamCurrentKnodeId = useSetRecoilState(ExamCurrentKnodeIdAtom)
    const getKnode = useGetKnode()
    const handleRight = useHandleRight()
    const handleWrong = useHandleWrong()
    const handleLayerUp = useHandleLayerUp()
    const handleLayerDown = useHandleLayerDown()
    const handleLayerRight = useHandleLayerRight()
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
    if(!mainMsg.knodeId) return <FinishSessionPrompt/>
    return (
        <Suspense fallback={<></>}>
            <div>
                <Row>
                    <Col span={8}>
                    <span className={classes.basic_info}>
                        正误比：{statisticsMsg.mistakes.length} : {statisticsMsg.corrects.length}
                    </span>
                    </Col>
                    <Col span={8} >
                    <span className={classes.basic_info}>
                        当前层正误比： {statisticsMsg.currentCorrects.length} : {statisticsMsg.currentMistakes.length}
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