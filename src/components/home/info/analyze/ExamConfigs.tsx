import React, {useEffect, useState} from 'react';
import {ExamStrategy, ExamStrategyTypes} from "../../../../service/data/mastery/ExamStrategy";
import classes from "./ExamSessionPanel.module.css";
import {Col, InputNumber, Menu, Popover, Radio, Row, Tooltip} from "antd";
import utils from "../../../../utils.module.css";
import {AlertOutlined, EditOutlined} from "@ant-design/icons";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {CurrentExamSessionAtom} from "../../../../recoil/home/ExamSession";
import {startExamSession} from "../../../../service/api/MasteryApi";
import {SelectedKnodeIdAtom} from "../../../../recoil/home/Knode";

const ExamConfigs = () => {
    const [examStrategy, setExamStrategy] = useState<ExamStrategy>({type:"full check", config:{}})
    const HotspotConfigs = ()=>{
        const [hotspotConfigs, setHotspotConfigs] = useState({threshold: 3, sampling: "random"})
        useEffect(()=>{
            setExamStrategy({...examStrategy, config: hotspotConfigs})
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
    const items = [
        {
            label: "全覆盖测试",
            key: ExamStrategyTypes.FULL_CHECK,
            configs: (
                <div className={classes.config_container}>
                    <span className={utils.no_data}>无需配置</span>
                </div>
            )
        },
        {
            label: "采样测试",
            key: ExamStrategyTypes.SAMPLING,
            configs: (
                <div className={classes.config_container}>
                    <span className={utils.no_data}>无需配置</span>
                </div>
            )
        },
        {
            label: "热点测试",
            key: ExamStrategyTypes.HOTSPOT,
            configs: <HotspotConfigs/>
        }
    ]
    const [selectedItem, setSelectedItem] = useState(items[0])
    useEffect(()=>{
        setSelectedItem(items.find(item=>item.key === examStrategy.type)!)
        //eslint-disable-next-line
    },[examStrategy.type])

    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const setCurrentSession = useSetRecoilState(CurrentExamSessionAtom)
    const start = async ()=>{
        setCurrentSession(await startExamSession(selectedKnodeId, examStrategy))
    }

    return (
        <div>
            <Row>
                <Col span={6}>
                    <Menu
                        defaultSelectedKeys={[examStrategy.type]}
                        onClick={({key})=>{setExamStrategy({config:undefined, type: key})}}
                        mode={"vertical"}
                        items={items.map(item=>({key: item.key, label: item.label}))}/>
                </Col>
                <Col span={16}>
                    {selectedItem.configs}
                </Col>
            </Row>
            <Row>
                <Col span={22}></Col>
                <Col span={2}>
                    <Tooltip title={"开始测试！"}>
                        <EditOutlined
                            className={utils.icon_button_large}
                            onClick={()=>start()}/>
                    </Tooltip>
                </Col>
            </Row>
        </div>
    )
};

export default ExamConfigs;