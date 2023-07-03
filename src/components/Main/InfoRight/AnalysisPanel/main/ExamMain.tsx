import React from 'react';
import {useRecoilValue} from "recoil";
import {CurrentExamStrategySelector} from "../../../../../recoil/home/ExamSession";
import {ExamStrategyTypes} from "../../../../../service/data/mastery/ExamStrategy";
import FullCheckExamMain from "./FullCheckExamMain/FullCheckExamMain";
import HotspotExamMain from "./HotspotExamMain/HotspotExamMain";
import HeuristicExamMain from "./HeuristicExamMain/HeuristicExamMain";
import RecentKnodeExamMain from "./RecentKnodeExamMain/RecentKnodeExamMain";

const ExamMain = () => {

    const examStrategy = useRecoilValue(CurrentExamStrategySelector)
    const router = ([
        {
            type: ExamStrategyTypes.FULL_CHECK,
            component: <FullCheckExamMain/>
        },
        {
            type: ExamStrategyTypes.HOTSPOT,
            component: <HotspotExamMain/>
        },
        {
            type: ExamStrategyTypes.SAMPLING,
            component: <FullCheckExamMain/>
        },
        {
            type: ExamStrategyTypes.HEURISTIC,
            component: <HeuristicExamMain/>
        },
        {
            type: ExamStrategyTypes.RECENT_KNODE,
            component: <RecentKnodeExamMain/>
        }
    ])

    return (
        <div>
            {router.find(item=>item.type === examStrategy.type)?.component}
        </div>
    );
};

export default ExamMain;