import React, {Suspense, useEffect, useState} from 'react';
import {EnhancerShare} from "../../../../../service/data/share/EnhancerShare";
import {
    getKnodeShare,
    getOwnedEnhancerShare,
    getUserShare,
} from "../../../../../service/api/ShareApi";
import {getChainStyleTitle} from "../../../../../service/api/KnodeApi";
import {Avatar, Breadcrumb, Col, Divider, Row, Tooltip} from "antd";
import classes from "./KnodeShareCard.module.css"
import EnhancerShareCard from "../EnhancerShareCard/EnhancerShareCard";
import {StarFilled, StarOutlined, UserOutlined} from "@ant-design/icons";
import {breadcrumbTitle} from "../../../../../service/data/Knode";
import {useRecoilState, useRecoilValue} from "recoil";
import {KnodeShareAtomFamily} from "../EnhancerShareCard/EnhancerShareCardHooks";
import {
    useEnhancerExists,
    useRemoveKnodeSubscribe, useRemoveUserSubscribe,
    useSubscribeKnode,
    useSubscribeUser,
    useVisit
} from "./KnodeShareCardHooks";

import {getUserPublicInfo} from "../../../../../service/api/LoginApi";
import {User} from "../../../../../service/data/Gateway";
import {CurrentKnodeSubscribesAtom, CurrentUserSubscribesAtom} from "../SharePanelHooks";
import {statisticDisplayAbbr} from "../../../../../service/utils/JsUtils";
import {UserShare} from "../../../../../service/data/share/UserShare";
import {SelectedKnodeIdAtom} from "../../../../../recoil/home/Knode";

const KnodeShareCard = (props:{knodeId: number}) => {

    const [owner, setOwner] = useState<User>()
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const knodeSubscribes = useRecoilValue(CurrentKnodeSubscribesAtom)
    const userSubscribes = useRecoilValue(CurrentUserSubscribesAtom)
    const [knodeShare, setKnodeShare] = useRecoilState(KnodeShareAtomFamily(props.knodeId))
    const [userShare, setUserShare] = useState<UserShare>()
    const [chainStyleTitle, setChainStyleTitle] = useState<string[]>([])
    const [enhancerShares, setEnhancerShares] = useState<EnhancerShare[]>([])
    const enhancerExists = useEnhancerExists()
    const visit = useVisit()
    const subscribeKnode = useSubscribeKnode()
    const subscribeUser = useSubscribeUser()
    const removeKnodeSubscribe = useRemoveKnodeSubscribe()
    const removeUserSubscribe = useRemoveUserSubscribe()
    useEffect(()=> {
        const init = async ()=>{
            const knodeShare = await getKnodeShare(props.knodeId);
            if(!knodeShare) return
            setKnodeShare(knodeShare)
            setUserShare(await getUserShare(knodeShare.userId))
            setEnhancerShares((await getOwnedEnhancerShare(props.knodeId)).filter(async (share)=>await enhancerExists(share.enhancerId)))
            setChainStyleTitle(await getChainStyleTitle(props.knodeId))
        }; init()
        //eslint-disable-next-line
    }, [props.knodeId])
    useEffect(()=>{
        const effect = async ()=>{
            knodeShare && setOwner(await getUserPublicInfo(knodeShare.userId))
        }; effect()
    }, [knodeShare])


    if(!knodeShare || !owner) return <></>
    return (
        <Suspense fallback={<></>}>
            <div className={classes.container}>
                <Row>
                    <Col span={18}>
                        <div className={classes.knode_title_wrapper}>
                            <div className={classes.knode_subscribe_wrapper}>{
                                knodeSubscribes.indexOf(knodeShare.knodeId) === -1 ?
                                <StarOutlined
                                    className={classes.subscribe_icon}
                                    onClick={()=>subscribeKnode(selectedKnodeId, knodeShare.knodeId)}/> :
                                <StarFilled
                                    className={classes.subscribe_icon}
                                    onClick={()=>removeKnodeSubscribe(selectedKnodeId, knodeShare.knodeId)}/>
                            }<span className={classes.subscribe_count}>{statisticDisplayAbbr(knodeShare.favorites)}</span>
                            </div>
                            <Breadcrumb items={breadcrumbTitle(chainStyleTitle, true)} className={classes.breadcrumb}/>
                        </div>

                    </Col>
                    <Col span={6}>
                        <div className={classes.user_info_wrapper}>
                            <div className={classes.user_subscribe_wrapper}>{
                                userSubscribes.indexOf(owner.id || 0) === -1 ?
                                <StarOutlined
                                    className={classes.subscribe_icon}
                                    onClick={()=>subscribeUser(selectedKnodeId, owner.id!)}/> :
                                <StarFilled
                                    className={classes.subscribe_icon}
                                    onClick={()=>removeUserSubscribe(selectedKnodeId, owner.id!)}/>
                                }<span className={classes.subscribe_count}>{statisticDisplayAbbr(userShare?.favorites!)}</span>
                            </div>
                            <Avatar shape={"circle"} size={32} src={owner.avatar} className={classes.avatar}><UserOutlined/></Avatar>
                            <Tooltip title={"点击访问"}>
                                 <span
                                     className={classes.user_info}
                                     onClick={()=>visit(owner, knodeShare?.knodeId)}>
                                    {owner.username}
                                </span>
                            </Tooltip>
                        </div>

                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col span={24}>{
                        enhancerShares.map(share=>(<EnhancerShareCard enhancerShare={share} key={`share${share.id}`}/>))
                    }</Col>
                </Row>
                <Divider/>
            </div>
        </Suspense>
    );
};

export default KnodeShareCard;