import React, {useEffect, useState} from 'react';
import {useRecoilState, useRecoilValue} from "recoil";
import {CurrentEnhancerSubscribesAtom} from "../SharePanelHooks";
import {EnhancerShare} from "../../../../../service/data/share/EnhancerShare";
import {getEnhancerShare} from "../../../../../service/api/ShareApi";
import {EnhancerCard} from "../../EnhancerPanel/EnhancerCard/EnhancerCard";
import {Col, Row} from "antd";
import {MinusOutlined} from "@ant-design/icons";
import utils from "../../../../../utils.module.css"
import {useRemoveEnhancerSubscribe} from "../EnhancerShareCard/EnhancerShareCardHooks";
import {SelectedKnodeIdAtom} from "../../../../../recoil/home/Knode";
import {ReadonlyModeAtom} from "../../../Main/MainHooks";

const EnhancerSubscribePanel = () => {
    const readonly = useRecoilValue(ReadonlyModeAtom)
    const [enhancerSubscribes,] = useRecoilState(CurrentEnhancerSubscribesAtom)
    const [enhancerShares, setEnhancerShares] = useState<EnhancerShare[]>([])
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const removeEnhancerSubscribe = useRemoveEnhancerSubscribe()
    useEffect(()=>{
        const effect = async ()=>{
            const temp = []
            for(let enhancerId of enhancerSubscribes)
                temp.push(await getEnhancerShare(enhancerId))
            setEnhancerShares(temp)
        }; effect()
    }, [enhancerSubscribes])
    return (
        <div>{
            enhancerShares.map((share)=>(
                <Row key={share.enhancerId}>
                    <Col span={22}>
                        <EnhancerCard id={share.enhancerId} readonly={true}/>
                    </Col>
                    <Col span={2}>{
                        !readonly &&
                        <MinusOutlined
                            className={utils.icon_button}
                            onClick={()=>removeEnhancerSubscribe(selectedKnodeId, share.enhancerId)}/>
                    }</Col>
                </Row>
            ))
        }</div>
    );
};

export default EnhancerSubscribePanel;