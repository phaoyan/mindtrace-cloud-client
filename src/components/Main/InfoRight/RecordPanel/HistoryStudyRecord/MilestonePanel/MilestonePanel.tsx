import React from 'react';
import {Col, Row, Timeline} from "antd";
import {useRecoilValue} from "recoil";
import {MilestoneCardsSelector, useAddMilestone} from "./MilestonePanelHooks";
import {PlusOutlined} from "@ant-design/icons";
import classes from "./MilestonePanel.module.css"
import utils from "../../../../../../utils.module.css"
import {ReadonlyModeAtom} from "../../../../Main/MainHooks";

const MilestonePanel = () => {
    const readonly = useRecoilValue(ReadonlyModeAtom)
    const milestoneCards = useRecoilValue(MilestoneCardsSelector)
    const addMilestone = useAddMilestone()
    return (
        <div>{
            !readonly &&
            <Row>
                <Col span={22} offset={1}>
                    <div className={`${classes.add_box}`}>
                        <PlusOutlined
                            className={utils.icon_button}
                            onClick={()=>addMilestone()}/>
                        &nbsp;&nbsp;
                        <span>添加里程碑 . . . </span>
                    </div>
                </Col>
            </Row>
            }<br/>
            <Row>
                <Col span={22} offset={1}>
                    <Timeline items={milestoneCards}/>
                </Col>
            </Row>
        </div>
    );
};



export default MilestonePanel;