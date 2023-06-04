import React, {useEffect, useState} from 'react';
import classes from "../../ExamSessionPanel.module.css";
import {Col, InputNumber, Popover, Radio, Row} from "antd";
import utils from "../../../../../../utils.module.css";
import {AlertOutlined} from "@ant-design/icons";
import {useRecoilState} from "recoil";
import {ExamStrategyAtom} from "../ExamConfigsHooks";

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
                <Row>
                    <Col span={8} className={utils.form_prompt}>
                        <span>下沉阈值</span>
                    </Col>
                    <Col span={14}>
                        <InputNumber
                            min={1} size={"small"}
                            onChange={(value)=>{
                                value && setHotspotConfigs({...hotspotConfigs, threshold: value})
                            }}/>
                    </Col>
                    <Col span={2}>
                        <Popover
                            arrow={false}
                            placement={"left"}
                            content={(
                                <div>

                                </div>
                            )}>
                            <AlertOutlined className={utils.icon_button}/>
                        </Popover>
                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col span={8} className={utils.form_prompt}>
                        <span>采样方式</span>
                    </Col>
                    <Col span={16}>
                        <Radio.Group
                            onChange={({target:{value}})=>{
                                value && setHotspotConfigs({...hotspotConfigs, sampling: value})
                            }}
                            options={[{value: "random", label: "随机取样"}, {value: "balanced", label: "按序取样"}]}/>
                    </Col>
                </Row>
            </div>
        </div>
    )
}
export default HotspotConfigs;