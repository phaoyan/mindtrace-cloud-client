import React, {useEffect, useState} from 'react';
import {defaultKnodeShare, KnodeShare} from "../../../../service/data/share/KnodeShare";
import {EnhancerShare} from "../../../../service/data/share/EnhancerShare";
import {getOwnedEnhancerShare, updateKnodeShare} from "../../../../service/api/ShareApi";
import {getChainStyleTitle} from "../../../../service/api/KnodeApi";
import {Breadcrumb, Col, Divider, Row} from "antd";
import classes from "./KnodeShareCard.module.css"
import EnhancerShareCard from "./EnhancerShareCard/EnhancerShareCard";
import {BranchesOutlined, EyeOutlined, LikeOutlined} from "@ant-design/icons";
import utils from "../../../../utils.module.css"
import {breadcrumbTitle} from "../../../../service/data/Knode";

const KnodeShareCard = (props:{knodeShare: KnodeShare}) => {

    const [knodeShare, setKnodeShare] = useState<KnodeShare>(defaultKnodeShare)
    const [chainStyleTitle, setChainStyleTitle] = useState<string[]>([])
    const [enhancerShares, setEnhancerShares] = useState<EnhancerShare[]>([])

    useEffect(()=> {
        const init = async ()=>{
            setKnodeShare(props.knodeShare)
            setEnhancerShares(await getOwnedEnhancerShare(props.knodeShare.knodeId))
            setChainStyleTitle(await getChainStyleTitle(props.knodeShare.knodeId))
        }; init()
    }, [props.knodeShare])

    if(enhancerShares.length === 0) return <></>
    return (
        <div className={classes.container}>
            <Row>
                <Col span={18}>
                    <Breadcrumb items={breadcrumbTitle(chainStyleTitle, true)} className={classes.breadcrumb}/>
                </Col>
                <Col span={6}>
                    <div className={classes.share_info}>
                        <div className={classes.info_item}>
                            <EyeOutlined />
                            <span>{knodeShare.visits}</span>
                        </div>
                        <div className={classes.info_item}>
                            <LikeOutlined
                                className={utils.icon_button_normal}
                                onClick={async ()=>{
                                    await updateKnodeShare(knodeShare.knodeId, {...knodeShare, likes: knodeShare.likes + 1})
                                    setKnodeShare({...knodeShare, likes: knodeShare.likes + 1})
                                }}/>
                            <span>{knodeShare.likes}</span>
                        </div>
                        <div className={classes.info_item}>
                            <BranchesOutlined />
                            <span>{knodeShare.favorites}</span>
                        </div>
                    </div>
                </Col>
                <Col span={2}></Col>
            </Row>
            <br/>
            <Row>
                <Col span={24}>
                    {enhancerShares.map(share=>(<EnhancerShareCard enhancerShare={share} key={share.id}/>))}
                </Col>
            </Row>
            <Divider/>
        </div>
    );
};

export default KnodeShareCard;