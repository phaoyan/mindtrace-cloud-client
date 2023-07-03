import React, {useEffect, useState} from 'react';
import {useRecoilState} from "recoil";
import {Col, InputNumber, Row} from "antd";
import classes from "../FullCheckConfigs/FullCheckConfigs.module.css";
import {ExamStrategyAtom} from "../ExamConfigsHooks";
import CurrentKnodeInfo from "../utils/CurrentKnodeInfo";

const SamplingConfigs = () => {

    const [examStrategy, setExamStrategy] = useRecoilState(ExamStrategyAtom)
    const [configs, setConfigs] = useState({size: 10})
    useEffect(()=>{
        setExamStrategy({...examStrategy, config: configs})
        //eslint-disable-next-line
    },[configs])

    return (
        <div>
            <CurrentKnodeInfo/>
            <br/>
            <Row>
                <Col span={10} offset={2}>
                    <span className={classes.info}>采样数量：</span>
                    <InputNumber
                        size={"small"} value={configs.size}
                        onChange={(value)=>{value && setConfigs({size: value})}}/>
                </Col>
            </Row>
        </div>
    );
};

export default SamplingConfigs;