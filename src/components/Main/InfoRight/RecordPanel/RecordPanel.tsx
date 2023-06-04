import React from 'react';
import {useRecoilState} from "recoil";
import {LearningTraceAtom} from "./RecordPanelHooks";

const RecordPanel = () => {

    const [learningTrace, setLearningTrace] = useRecoilState(LearningTraceAtom)

    return (
        <div>
            RECORD
        </div>
    );
};

export default RecordPanel;