import React, {Suspense} from 'react';
import {useRecoilState, useRecoilValue} from "recoil";
import {CurrentExamSessionAtom} from "../../../../../../recoil/home/ExamSession";
import {
    ExamSessionMsgAtom,
} from "../utils/GeneralHooks";
import {useInitKnodeAndQuizzes, useInitSessionMsgWithMainAndStatistics} from "../HotspotExamMain/HotspotExamMainHooks";
import MistakesAndCorrects from "../utils/MistakesAndCorrects";
import DividerTimer from "../utils/DividerTimer";
import TitleAndOptions from "../utils/TitleAndOptions";
import QuizDisplay from "../utils/QuizDisplay";
import CrossAndCheck from "../utils/CrossAndCheck";
import {useHandleRight, useHandleWrong} from "../FullCheckExamMain/FullCheckExamMainHooks";

const RecentKnodeExamMain = () => {

    const currentSession = useRecoilValue(CurrentExamSessionAtom)
    const [sessionMsg,] = useRecoilState(ExamSessionMsgAtom)
    const handleRight = useHandleRight()
    const handleWrong = useHandleWrong()
    useInitSessionMsgWithMainAndStatistics()
    useInitKnodeAndQuizzes()

    if(!currentSession) return <></>
    return (
        <Suspense fallback={<></>}>
            <div>
                {sessionMsg.statistics && sessionMsg.statistics.mistakes &&  <MistakesAndCorrects/>}
                <DividerTimer startTime={currentSession.startTime} id={currentSession.id}/>
                <TitleAndOptions/>
                {sessionMsg && sessionMsg.main && !sessionMsg.main.knodeId && <>没有数据（可能是因为所选时间段并无新增知识点）</>}
                <QuizDisplay/>
                {sessionMsg.statistics && sessionMsg.statistics.mistakes &&  <CrossAndCheck check={handleRight} cross={handleWrong}/>}
            </div>
        </Suspense>
    );
};

export default RecentKnodeExamMain;