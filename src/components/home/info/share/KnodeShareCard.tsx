import React, {useEffect, useState} from 'react';
import {defaultKnodeShare, KnodeShare} from "../../../../service/data/share/KnodeShare";
import {EnhancerShare} from "../../../../service/data/share/EnhancerShare";
import {getOwnedEnhancerShare, updateKnodeShare} from "../../../../service/api/ShareApi";
import {getChainStyleTitle} from "../../../../service/api/KnodeApi";
import {BreadcrumbItemType} from "antd/es/breadcrumb/Breadcrumb";
import MdPreview from "../../../utils/markdown/MdPreview";
import {Breadcrumb, Col, Divider, Popover, Row} from "antd";
import classes from "./KnodeShareCard.module.css"
import EnhancerShareCard from "./EnhancerShareCard";
import {BranchesOutlined, EyeOutlined, LikeOutlined} from "@ant-design/icons";
import utils from "../../../../utils.module.css"

const KnodeShareCard = (props:{knodeShare: KnodeShare}) => {

    const [knodeShare, setKnodeShare] = useState<KnodeShare>(defaultKnodeShare)
    const [chainStyleTitle, setChainStyleTitle] = useState<string[]>([])
    const [enhancerShares, setEnhancerShares] = useState<EnhancerShare[]>([])
    const init = async ()=>{
        setKnodeShare(props.knodeShare)
        setEnhancerShares(await getOwnedEnhancerShare(props.knodeShare.knodeId))
        setChainStyleTitle(await getChainStyleTitle(props.knodeShare.knodeId))
    }
    // eslint-disable-next-line
    useEffect(()=> {init()}, [props.knodeShare])

    const breadcrumbTitle = ():BreadcrumbItemType[] =>{
        if(chainStyleTitle)
            return chainStyleTitle
                .filter(title=> title !== "ROOT")
                .map(title=>({title: <MdPreview>{title}</MdPreview>})).reverse()
        return []
    }

    const handleLike = ()=>{
        setKnodeShare({...knodeShare, likes: knodeShare.likes + 1})
        updateKnodeShare(knodeShare.knodeId, {...knodeShare, likes: knodeShare.likes + 1})
    }

    if(enhancerShares.length === 0) return <></>
    return (
        <div className={classes.container}>
            <Row>
                <Col span={12}>
                    <Popover
                        arrow={false}
                        content={<Breadcrumb items={breadcrumbTitle()} className={classes.breadcrumb}/>}>
                        <span className={classes.knode_title}>{knodeShare.knode.title}</span>
                    </Popover>
                </Col>
                <Col span={10}>
                    <div className={classes.share_info}>
                        <div className={classes.info_item}>
                            <EyeOutlined />
                            <span>{knodeShare.visits}</span>
                        </div>
                        <div className={classes.info_item}>
                            <LikeOutlined
                                className={utils.icon_button_normal}
                                onClick={handleLike}/>
                            <span>{knodeShare.likes}</span>
                        </div>
                        <div className={classes.info_item}>
                            <BranchesOutlined />
                            <span>{knodeShare.favorites}</span>
                        </div>
                    </div>
                </Col>
                <Col span={2}>
                    <div className={classes.fork}>
                        {/*<BranchesOutlined*/}
                        {/*    className={utils.icon_button}*/}
                        {/*    style={{position:"relative", top:"0.5em"}}*/}
                        {/*    onClick={handleFork}/>*/}
                    </div>
                </Col>
            </Row>
            <Divider className={utils.ghost_horizontal_divider}/>
            <Row>
                <Col>
                    {enhancerShares.map(share=>(<EnhancerShareCard enhancerShare={share} key={share.id}/>))}
                </Col>
            </Row>
        </div>
    );
};

export default KnodeShareCard;