import React from 'react';
import {EnhancerShare} from "../../../../service/data/share/EnhancerShare";
import {EnhancerCard} from "../enhancer/EnhancerCard";
import {Col, Row} from "antd";
import {BranchesOutlined} from "@ant-design/icons";
import classes from "./KnodeShareCard.module.css";
import utils from "../../../../utils.module.css";
import {forkEnhancerShare} from "../../../../service/api/ShareApi";
import {useRecoilState, useRecoilValue} from "recoil";
import {SelectedKnodeIdAtom} from "../../../../recoil/home/Knode";
import {EnhancersForSelectedKnodeAtom} from "../../../../recoil/home/Enhancer";
import useMessage from "antd/es/message/useMessage";

const EnhancerShareCard = (props:{enhancerShare: EnhancerShare}) => {

    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [enhancersForSelectedKnode, setEnhancersForSelectedKnode] = useRecoilState(EnhancersForSelectedKnodeAtom)
    const [messageApi, contextHolder] = useMessage()
    const handleFork = async ()=>{
        setEnhancersForSelectedKnode([...enhancersForSelectedKnode, await forkEnhancerShare(props.enhancerShare.id, selectedKnodeId)])
        messageApi.success("笔记复制成功！（前往”笔记“查看）")
    }
    return (
        <div>
            {contextHolder}
            <Row>
                <Col span={22}>
                    <EnhancerCard id={props.enhancerShare.enhancerId} readonly={true}/>
                </Col>
                <Col span={2}>
                    <div className={classes.fork}>
                        <BranchesOutlined
                            className={utils.icon_button}
                            style={{position:"relative", top:"0.5em"}}
                            onClick={handleFork}/>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default EnhancerShareCard;