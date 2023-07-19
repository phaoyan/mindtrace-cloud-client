import React, {Suspense, useEffect, useState} from 'react';
import {Col, Row} from "antd";
import classes from "./FullCheckExamMain.module.css";
import utils from "../../../../../../utils.module.css";
import {useRecoilState} from "recoil";
import {CurrentExamSessionAtom} from "../../../../../../recoil/home/ExamSession";
import {Resource, ResourcePlayer} from "../../../EnhancerPanel/EnhancerCard/EnhancerCardHooks"
import CrossAndCheck from "../utils/CrossAndCheck";
import DividerTimer from "../utils/DividerTimer";
import FinishSessionPrompt from "../utils/FinishSessionPrompt";
import TitleAndOptions from "../utils/TitleAndOptions";
import {ExamSessionMsgAtom} from "../utils/GeneralHooks";
import {useHandleRight, useHandleWrong} from "./FullCheckExamMainHooks";
import {useInitKnodeAndQuizzes, useInitSessionMsgWithMainAndStatistics} from "../HotspotExamMain/HotspotExamMainHooks";
import MistakesAndCorrects from "../utils/MistakesAndCorrects";
import QuizDisplay from "../utils/QuizDisplay";

const FullCheckExamMain = () => {

    const [currentSession,] = useRecoilState(CurrentExamSessionAtom)
    const [sessionMsg] = useRecoilState(ExamSessionMsgAtom)
    const [done, setDone] = useState<boolean>(false)
    const handleRight = useHandleRight()
    const handleWrong = useHandleWrong()
    useInitSessionMsgWithMainAndStatistics()
    useInitKnodeAndQuizzes()

    useEffect(()=>{
        if(!sessionMsg.statistics) return
        if(sessionMsg.statistics.selected.length !== 0 &&
            sessionMsg.statistics.mistakes.length
            + sessionMsg.statistics.corrects.length
            === sessionMsg.statistics.selected.length)
            setDone(true)
    },[sessionMsg])


    if(!currentSession) return <></>
    if(done) return <FinishSessionPrompt/>
    return (
        <Suspense fallback={<></>}>
            <div className={classes.container}>
                {sessionMsg.statistics && <MistakesAndCorrects/>}
                <DividerTimer startTime={currentSession.startTime} id={currentSession.id}/>
                <TitleAndOptions/>
                <QuizDisplay/>
                <CrossAndCheck check={handleRight} cross={handleWrong}/>
            </div>
        </Suspense>
    );
};

export default FullCheckExamMain;