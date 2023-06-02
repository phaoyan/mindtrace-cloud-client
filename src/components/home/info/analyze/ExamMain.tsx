import React from 'react';
import {useRecoilValue} from "recoil";
import {CurrentExamStrategySelector} from "../../../../recoil/home/ExamSession";
import {ExamStrategyTypes} from "../../../../service/data/mastery/ExamStrategy";
import FullCheckExamMain from "./main/FullCheckExamMain";
import HotspotExamMain from "./main/HotspotExamMain";
import SamplingExamMain from "./main/SamplingExamMain";

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
            component: <SamplingExamMain/>
        }
    ])

    return (
        <div>
            {router.find(item=>item.type === examStrategy.type)?.component}
        </div>
    );
};

export default ExamMain;