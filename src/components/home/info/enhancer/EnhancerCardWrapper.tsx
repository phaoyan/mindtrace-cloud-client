import React, {useState} from 'react';
import {Button, Col, Row} from "antd";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import utils from "../../../../utils.module.css";
import {removeEnhancer} from "../../../../service/api/EnhancerApi";
import classes from "./EnhancerCardWrapper.module.css"
import {EnhancerCard} from "./EnhancerCard";
import {useRecoilState, useRecoilValue} from "recoil";
import {LearningTraceAtom} from "../../../../recoil/LearningTrace";
import {startLearning} from "../../../../service/api/TracingApi";
import {UserID} from "../../../../recoil/User";
import {EnhancersForSelectedKnodeAtom} from "../../../../recoil/home/Enhancer";

const EnhancerCardWrapper = (props: { id: number}) => {

    const userId = useRecoilValue(UserID)
    const [learningTrace, setLearningTrace] = useRecoilState(LearningTraceAtom)
    const [enhancersForSelectedKnode, setEnhancersForSelectedKNode] = useRecoilState(EnhancersForSelectedKnodeAtom)
    const handleStartLearning = ()=>{
        startLearning(userId, props.id)
            .then((data)=>{
                setLearningTrace(data)
            })
    }

    const handleRemove = async ()=>{
        await removeEnhancer(props.id)
        setEnhancersForSelectedKNode(enhancersForSelectedKnode.filter(enhancer=>enhancer.id !== props.id))
    }

    return (
        <div>
            <EnhancerCard id={props.id}/>
            <div className={classes.footer_part}>
                <Row>
                    <Col span={23}>
                        {
                            !learningTrace &&
                            <Button
                                style={{border: "none"}}
                                icon={<EditOutlined/>}
                                onClick={handleStartLearning}>
                                开始学习
                            </Button>
                        }
                    </Col>
                    <Col span={1}>
                        <DeleteOutlined
                            style={{position:"relative", left:"-0.3em"}}
                            className={utils.icon_button}
                            onClick={handleRemove}/>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default EnhancerCardWrapper;