import React from 'react';
import classes from "./ExamSessionPanel.module.css"
import {useRecoilValue} from "recoil";
import ExamConfigs from "./ExamConfigs/ExamConfigs";
import {CurrentExamSessionAtom} from "../../../../recoil/home/ExamSession";
import ExamMain from "./main/ExamMain";

const ExamSessionPanel = () => {
    const currentSession = useRecoilValue(CurrentExamSessionAtom)
    return (
        <div className={classes.container}>{
            currentSession ? <ExamMain/>: <ExamConfigs/>
        }</div>
    );
};

export default ExamSessionPanel;