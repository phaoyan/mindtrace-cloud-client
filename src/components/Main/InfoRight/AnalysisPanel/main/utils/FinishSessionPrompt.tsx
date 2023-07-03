import React from 'react';
import classes from "../HotspotExamMain/HotspotExamMain.module.css";
import utils from "../../../../../../utils.module.css";
import {useFinish} from "./GeneralHooks";

const FinishSessionPrompt = () => {
    const finish = useFinish()
    return (
        <div className={classes.placeHolder}>
            <span
                className={utils.text_button}
                onClick={finish}>
                完成！
            </span>
        </div>
    );
};


export default FinishSessionPrompt;