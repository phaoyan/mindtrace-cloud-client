import React from 'react';
import {EnhancerShare} from "../../../../../service/data/share/EnhancerShare";
import {Col, Row} from "antd";
import {BranchesOutlined} from "@ant-design/icons";
import classes from "./EnhancerShareCard.module.css";
import utils from "../../../../../utils.module.css";
import {useRecoilValue} from "recoil";
import {
    EnhancerAtomFamily,
    EnhancerResourcesAtomFamily,
    ResourcePlayer
} from "../../EnhancerPanel/EnhancerCard/EnhancerCardHooks";
import {useFork} from "./EnhancerShareCardHooks";

const EnhancerShareCard = (props:{enhancerShare: EnhancerShare}) => {

    const enhancer = useRecoilValue(EnhancerAtomFamily(props.enhancerShare.enhancerId))
    const resources = useRecoilValue(EnhancerResourcesAtomFamily(props.enhancerShare.enhancerId))
    const handleFork = useFork(props.enhancerShare.id)
    return (
        <div>
            <Row>
                <Col span={23}>
                    <div className={classes.header}>
                        <span className={classes.title}>{enhancer.title}</span>
                    </div>
                    <div className={classes.body}>{
                        resources.map(resource=><ResourcePlayer resource={resource} readonly={true}/>)
                    }</div>
                </Col>
                <Col span={1}>
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