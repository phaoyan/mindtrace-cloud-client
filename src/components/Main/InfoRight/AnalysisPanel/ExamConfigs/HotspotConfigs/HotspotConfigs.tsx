import React, {useEffect, useState} from 'react';
import classes from "./HotspotConfigs.module.css";
import {Col, InputNumber, Row} from "antd";
import {useRecoilState} from "recoil";
import {ExamStrategyAtom} from "../ExamConfigsHooks";
import CurrentKnodeInfo from "../utils/CurrentKnodeInfo";

const HotspotConfigs = ()=>{
    const [examStrategy, setExamStrategy] = useRecoilState(ExamStrategyAtom)
    const [hotspotConfigs, setHotspotConfigs] = useState({threshold: 3, sampling: "random"})
    useEffect(()=>{
        setExamStrategy({...examStrategy, config: hotspotConfigs})
        //eslint-disable-next-line
    },[hotspotConfigs])

    return (
        <div className={classes.config_container}>
            <div className={classes.config_rows}>
                <CurrentKnodeInfo/>
                <br/>
                <Row>
                    <Col span={12} className={classes.info} offset={2}>
                        <span>下沉阈值：</span>
                        <InputNumber
                            min={1} size={"small"}
                            value={hotspotConfigs.threshold}
                            onChange={(value)=>{
                                value && setHotspotConfigs({...hotspotConfigs, threshold: value})
                            }}/>
                    </Col>
                </Row>
            </div>
        </div>
    )
}
export default HotspotConfigs;