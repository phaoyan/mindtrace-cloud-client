import React from 'react';
import {LearningTraceAtom} from "../../recoil/LearningTrace";
import {LearningTrace} from "../../service/data/Mindtrace";
import {useRecoilState} from "recoil";

const TraceInfo = () => {
    const [learningTrace, ] = useRecoilState<LearningTrace>(LearningTraceAtom)

    if(learningTrace)
        return (
            <div>
                <div>{learningTrace.createTime}</div>
            </div>
        );
    else return <></>
};

export default TraceInfo;