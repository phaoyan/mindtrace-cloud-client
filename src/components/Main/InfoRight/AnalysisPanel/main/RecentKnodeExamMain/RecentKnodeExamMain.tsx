import React, {Suspense, useEffect} from 'react';
import {useRecoilState, useRecoilValue} from "recoil";
import {CurrentExamSessionAtom, ExamCurrentQuizzesAtom} from "../../../../../../recoil/home/ExamSession";
import {
    ExamSessionMsgAtom,
} from "../utils/GeneralHooks";
import {useGetKnode} from "../../ExamConfigs/HotspotConfigs/HotspotConfigsHooks";
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
                {sessionMsg && sessionMsg.main && !sessionMsg.main.knodeId && <>没有数据</>}
                <QuizDisplay/>
                <CrossAndCheck check={handleRight} cross={handleWrong}/>
            </div>
        </Suspense>
    );
};

export default RecentKnodeExamMain;