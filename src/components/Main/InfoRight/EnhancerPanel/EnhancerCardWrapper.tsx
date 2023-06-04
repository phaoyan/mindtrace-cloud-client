import React from 'react';
import {Col, Row} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import utils from "../../../../utils.module.css";
import {removeEnhancer} from "../../../../service/api/EnhancerApi";
import classes from "./EnhancerCardWrapper.module.css"
import {EnhancerCard} from "./EnhancerCard/EnhancerCard";
import {useRecoilState} from "recoil";
import {EnhancersForSelectedKnodeAtom} from "../../../../recoil/home/Enhancer";

const EnhancerCardWrapper = (props: { id: number}) => {

    const [enhancersForSelectedKnode, setEnhancersForSelectedKNode] = useRecoilState(EnhancersForSelectedKnodeAtom)
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