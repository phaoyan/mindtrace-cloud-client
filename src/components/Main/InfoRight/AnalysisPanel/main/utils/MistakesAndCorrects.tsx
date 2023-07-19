import React from 'react';
import {useRecoilState} from "recoil";
import {ExamSessionMsgAtom} from "./GeneralHooks";
import {Col, Row} from "antd";
import classes from "../FullCheckExamMain/FullCheckExamMain.module.css";

const MistakesAndCorrects = () => {
    const [sessionMsg] = useRecoilState(ExamSessionMsgAtom)
    return (
        <Row>
            <Col span={4} offset={6}>
                            <span className={classes.basic_info}>
                                错误数：{sessionMsg.statistics.mistakes.length}
                            </span>
            </Col>
            <Col span={4} >
                            <span className={classes.basic_info}>
                                正确数：{sessionMsg.statistics.corrects.length}
                            </span>
            </Col>
            <Col span={4}>
                            <span className={classes.basic_info}>
                                总题数：{sessionMsg.statistics.selected.length}
                            </span>
            </Col>
        </Row>
    );
};

export default MistakesAndCorrects;