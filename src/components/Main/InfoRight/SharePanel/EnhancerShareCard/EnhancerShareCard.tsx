import React, {useEffect} from 'react';
import {EnhancerShare} from "../../../../../service/data/share/EnhancerShare";
import {Col, Row} from "antd";
import {StarFilled, StarOutlined} from "@ant-design/icons";
import classes from "./EnhancerShareCard.module.css";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    EnhancerAtomFamily,
    EnhancerResourcesAtomFamily,
    ResourcePlayer
} from "../../EnhancerPanel/EnhancerCard/EnhancerCardHooks";
import {getEnhancerById} from "../../../../../service/api/EnhancerApi";
import {getResourcesFromEnhancer} from "../../../../../service/api/ResourceApi";
import {CurrentEnhancerSubscribesAtom} from "../SharePanelHooks";
import {statisticDisplayAbbr} from "../../../../../service/utils/JsUtils";
import {useRemoveEnhancerSubscribe, useSubscribeEnhancer} from "./EnhancerShareCardHooks";
import {SelectedKnodeIdAtom} from "../../../../../recoil/home/Knode";

const EnhancerShareCard = (props:{enhancerShare: EnhancerShare}) => {

    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const enhancerSubscribes = useRecoilValue(CurrentEnhancerSubscribesAtom)
    const [enhancer, setEnhancer] = useRecoilState(EnhancerAtomFamily(props.enhancerShare.enhancerId))
    const [resources, setResources] = useRecoilState(EnhancerResourcesAtomFamily(props.enhancerShare.enhancerId))
    const subscribeEnhancer = useSubscribeEnhancer()
    const removeEnhancerSubscribe = useRemoveEnhancerSubscribe()
    useEffect(()=>{
        const init = async ()=>{
            setEnhancer(await getEnhancerById(props.enhancerShare.enhancerId))
            setResources(await getResourcesFromEnhancer(props.enhancerShare.enhancerId))
        };init()
        //eslint-disable-next-line
    }, [props.enhancerShare.enhancerId])
    return (
        <div>
            <Row>
                <Col span={23}>
                    <div className={classes.header}>
                        <div className={classes.subscribe_wrapper}>{
                            enhancerSubscribes.indexOf(enhancer.id) === -1 ?
                            <StarOutlined
                                className={classes.subscribe_icon}
                                onClick={()=>subscribeEnhancer(selectedKnodeId, enhancer.id)}/>:
                            <StarFilled
                                className={classes.subscribe_icon}
                                onClick={()=>removeEnhancerSubscribe(selectedKnodeId, enhancer.id)}/>
                            }<span className={classes.subscribe_count}>{
                                statisticDisplayAbbr(props.enhancerShare.favorites)
                        }</span>
                        </div>
                        <span className={classes.title}>{enhancer.title}</span>
                    </div>
                    <div className={classes.body}>{
                        resources.map(resource=><ResourcePlayer resource={resource} readonly={true} key={resource.id}/>)
                    }</div>
                </Col>
                <Col span={1}>
                    <div className={classes.fork}>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default EnhancerShareCard;