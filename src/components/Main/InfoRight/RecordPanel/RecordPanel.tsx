import React from 'react';
import CurrentStudyRecord from "./CurrentStudyRecord/CurrentStudyRecord";
import HistoryStudyRecord from "./HistoryStudyRecord/HistoryStudyRecord";
import {Divider} from "antd";
import {useRecoilValue} from "recoil";
import {CurrentUserIdSelector} from "../../Main/MainHooks";
import {LoginUserIdSelector} from "../../../Login/LoginHooks";

const RecordPanel = () => {
    const currentUserId = useRecoilValue(CurrentUserIdSelector)
    const loginUserId = useRecoilValue(LoginUserIdSelector)
    return (
        <div>
            {loginUserId === currentUserId && <CurrentStudyRecord/>}
            {loginUserId === currentUserId && <Divider/>}
            <HistoryStudyRecord/>
        </div>
    );
};

export default RecordPanel;