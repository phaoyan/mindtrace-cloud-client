import React from 'react';
import CurrentStudyRecord from "./CurrentStudyRecord/CurrentStudyRecord";
import HistoryStudyRecord from "./HistoryStudyRecord/HistoryStudyRecord";
import {Divider} from "antd";

const RecordPanel = () => {
    return (
        <div>
            <CurrentStudyRecord/>
            <Divider/>
            <HistoryStudyRecord/>
        </div>
    );
};

export default RecordPanel;