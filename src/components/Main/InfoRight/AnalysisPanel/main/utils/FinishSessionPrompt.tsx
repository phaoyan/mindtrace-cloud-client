import React from 'react';
import {useRecoilState} from "recoil";
import {CurrentExamSessionAtom} from "../../../../../../recoil/home/ExamSession";
import classes from "../HotspotExamMain/HotspotExamMain.module.css";
import utils from "../../../../../../utils.module.css";
import {finishExamSession} from "../../../../../../service/api/MasteryApi";

const FinishSessionPrompt = () => {
    const [currentSession, setCurrentSession] = useRecoilState(CurrentExamSessionAtom)
    return (
        <div className={classes.placeHolder}>
            <span
                className={utils.text_button}
                onClick={async ()=>{
                    if(!currentSession) return
                    await finishExamSession(currentSession.id)
                    setCurrentSession(undefined)
                }}>
                完成！
            </span>
        </div>
    );
};

export default FinishSessionPrompt;