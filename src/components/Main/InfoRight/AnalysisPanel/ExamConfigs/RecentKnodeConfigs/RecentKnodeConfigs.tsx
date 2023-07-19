import React, {useEffect, useState} from 'react';
import CurrentKnodeInfo from "../utils/CurrentKnodeInfo";
import {Col, DatePicker, Row} from "antd";
import {useRecoilState} from "recoil";
import {ExamStrategyAtom} from "../ExamConfigsHooks";
import {ArrowRightOutlined} from "@ant-design/icons";
import classes from "./RecentKnodeConfigs.module.css";
import {DEFAULT_DATE_TIME_PATTERN} from "../../../../../../service/utils/constants";

const RecentKnodeConfigs = () => {
    const [examStrategy, setExamStrategy] = useRecoilState(ExamStrategyAtom)
    const [configs, setConfigs] = useState<any>({before: undefined, after: undefined})
    useEffect(()=>{
        setExamStrategy({...examStrategy, config: configs})
        //eslint-disable-next-line
    },[configs])
    return (
        <div>
            <CurrentKnodeInfo/>
            <br/>
            <Row>
                <Col span={22} offset={2} className={classes.options}>
                    <DatePicker
                        placeholder={"采样起始时间"}
                        onChange={(value)=>{
                            value && setConfigs({...configs, after: value.format(DEFAULT_DATE_TIME_PATTERN)})
                        }} />
                    <ArrowRightOutlined/>
                    <DatePicker
                        placeholder={"采样终止时间"}
                        onChange={(value)=>{
                            value && setConfigs({...configs, before: value.format(DEFAULT_DATE_TIME_PATTERN)})
                        }} />
                </Col>
            </Row>
        </div>
    )
};

export default RecentKnodeConfigs;