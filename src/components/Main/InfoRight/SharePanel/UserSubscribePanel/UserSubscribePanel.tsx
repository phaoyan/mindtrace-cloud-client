import React, {useEffect, useState} from 'react';
import {useRecoilValue} from "recoil";
import {CurrentUserSubscribesAtom} from "../SharePanelHooks";
import {useRemoveUserSubscribe, useSubscribeUser, useVisit} from "../KnodeShareCard/KnodeShareCardHooks";
import {User} from "../../../../../service/data/Gateway";
import {getUserPublicInfo} from "../../../../../service/api/LoginApi";
import {Avatar, Col, Divider, Pagination, Row} from "antd";
import {VisitOutlined} from "../../../../utils/antd/icons/Icons";
import classes from "./UserSubscribePanel.module.css"
import utils  from "../../../../../utils.module.css"
import {MinusOutlined, StarOutlined} from "@ant-design/icons";
import {UserShare} from "../../../../../service/data/share/UserShare";
import {getUserShare} from "../../../../../service/api/ShareApi";
import {SelectedKnodeIdAtom} from "../../../../../recoil/home/Knode";
import {statisticDisplayAbbr} from "../../../../../service/utils/JsUtils";
import {CurrentTabAtom} from "../../InfoRightHooks";
import {LoginUserIdSelector} from "../../../../Login/LoginHooks";
import {CurrentUserIdSelector, ReadonlyModeAtom} from "../../../Main/MainHooks";
import {getEnhancersByDate} from "../../../../../service/api/EnhancerApi";
import {EnhancerCard} from "../../EnhancerPanel/EnhancerCard/EnhancerCard";
import {Enhancer} from "../../../../../service/data/Enhancer";

const UserSubscribePanel = () => {
    const readonly = useRecoilValue(ReadonlyModeAtom)
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const removeUserSubscribe = useRemoveUserSubscribe()
    const userSubscribes = useRecoilValue(CurrentUserSubscribesAtom)
    const [userInfoList, setUserInfoList] = useState<{ info: User, share: UserShare }[]>([])
    useEffect(()=>{
        const effect = async ()=>{
            const temp = []
            for(let userId of userSubscribes)
                temp.push({info: await getUserPublicInfo(userId), share: await getUserShare(userId)})
            setUserInfoList(temp)
        }; effect().then()
    }, [userSubscribes])

    return (
        <div>{
            userInfoList.map((info)=> (
                <Row key={info.info.id}>
                    <Col span={22}>
                        <UserInfoItem  info={info.info} share={info.share}/>
                    </Col>
                    <Col span={2}>{
                        !readonly &&
                        <MinusOutlined
                            className={utils.icon_button}
                            style={{position:"relative", top:"0.3em"}}
                            onClick={()=>removeUserSubscribe(selectedKnodeId, info.info.id!)}/>
                    }</Col>
                </Row>))
        }</div>
    );
};

export const UserInfoItem = (props:{info: User, share: UserShare})=>{
    const visit = useVisit()
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const currentTab = useRecoilValue(CurrentTabAtom)
    const subscribe = useSubscribeUser()
    const loginId = useRecoilValue(LoginUserIdSelector)
    const currentUserId = useRecoilValue(CurrentUserIdSelector)
    const userSubscribes = useRecoilValue(CurrentUserSubscribesAtom)
    const [recentEnhancers, setRecentEnhancers] = useState<Enhancer[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 5
    useEffect(()=>{
        const effect = async ()=>{
            const enhancers = await getEnhancersByDate(props.info.id!)
            setRecentEnhancers(enhancers.reverse().slice(0,20))
        }; effect().then()
    //eslint-disable-next-line
    }, [])
    return (
        <div>
            <Row>
                <Col span={2} className={classes.left_option}>
                    <VisitOutlined
                        className={utils.icon_button}
                        onClick={()=>visit(props.info)}/>
                </Col>
                <Col span={8} className={classes.user_info}>
                    <Avatar shape={"circle"} size={32} src={props.info.avatar}/>
                    <span className={classes.username}>{props.info.username}</span>
                </Col>
                <Col span={3} offset={10} className={classes.share_info}>{
                    (currentTab === "note" ||
                    userSubscribes.indexOf(props.info.id!) !== -1) &&
                        <StarOutlined/>}{
                    currentTab === "share" &&
                    loginId === currentUserId &&
                    userSubscribes.indexOf(props.info.id!) === -1 &&
                        <StarOutlined
                            className={utils.icon_button}
                            onClick={()=>subscribe(selectedKnodeId, props.info.id!)}/>
                    }<span className={classes.share_info_count}>{statisticDisplayAbbr(props.share.favorites)}</span>
                </Col>
            </Row>
            <Row>
                <Col span={22} offset={1}>{
                    recentEnhancers
                        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                        .map(enhancer=><EnhancerCard id={enhancer.id} readonly={true} key={enhancer.id}/>)
                    }<Pagination
                        onChange={(page)=>setCurrentPage(page)}
                        defaultCurrent={1}
                        total={recentEnhancers.length}
                        hideOnSinglePage={true}
                        pageSize={pageSize}/>
                </Col>
            </Row>
            <Divider style={{margin:"0.5em"}}/>
        </div>
    )
}

export default UserSubscribePanel;