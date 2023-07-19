import React from 'react';
import { ResourcePlayer} from "../../../EnhancerPanel/EnhancerCard/EnhancerCardHooks";
import classes from "../FullCheckExamMain/FullCheckExamMain.module.css";
import utils from "../../../../../../utils.module.css";
import {ExamCurrentQuizzesAtom} from "../../../../../../recoil/home/ExamSession";
import {useRecoilState} from "recoil";

const QuizDisplay = () => {
    const [currentQuiz,] = useRecoilState(ExamCurrentQuizzesAtom)
    return (
        <>
            {currentQuiz && currentQuiz.map(quiz=><ResourcePlayer key={quiz.id} resource={quiz}/>)}
            {currentQuiz && currentQuiz.length === 0 &&
            <div className={classes.placeHolder}>
                <span className={utils.no_data} style={{height:"20vh"}}>No Data</span>
            </div>}
        </>
    );
};

export default QuizDisplay;