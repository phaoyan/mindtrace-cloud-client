import React, {useEffect, useState} from 'react';
import {Col, Menu, Row, Tooltip} from "antd";
import utils from "../../../../../utils.module.css";
import {EditOutlined} from "@ant-design/icons";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {CurrentExamSessionAtom} from "../../../../../recoil/home/ExamSession";
import {startExamSession} from "../../../../../service/api/MasteryApi";
import {SelectedKnodeIdAtom} from "../../../../../recoil/home/Knode";
import {ExamStrategyAtom, useMenuItems} from "./ExamConfigsHooks";

const ExamConfigs = () => {
    const [examStrategy, setExamStrategy] = useRecoilState(ExamStrategyAtom)
    const items = useMenuItems()
    const [selectedItem, setSelectedItem] = useState(items[0])
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const setCurrentSession = useSetRecoilState(CurrentExamSessionAtom)
    useEffect(()=>{
        setSelectedItem(items.find(item=>item.key === examStrategy.type)!)
        //eslint-disable-next-line
    },[examStrategy.type])

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
                            onClick={async ()=>setCurrentSession(await startExamSession(selectedKnodeId, examStrategy))}/>
                    </Tooltip>
                </Col>
            </Row>
        </div>
    )
};

export default ExamConfigs;