import React, {useEffect, useState} from 'react';
import {useRecoilValue} from "recoil";
import {CurrentUserSubscribesAtom} from "../SharePanelHooks";
import {useRemoveUserSubscribe, useVisit} from "../KnodeShareCard/KnodeShareCardHooks";
import {User} from "../../../../../service/data/Gateway";
import {getUserPublicInfo} from "../../../../../service/api/LoginApi";
import {Avatar, Col, Divider, Row} from "antd";
import {VisitOutlined} from "../../../../utils/antd/icons/Icons";
import classes from "./UserSubscribePanel.module.css"
import utils  from "../../../../../utils.module.css"
import {MinusOutlined, StarOutlined} from "@ant-design/icons";
import {UserShare} from "../../../../../service/data/share/UserShare";
import {getUserShare} from "../../../../../service/api/ShareApi";
import {SelectedKnodeIdAtom} from "../../../../../recoil/home/Knode";
import {statisticDisplayAbbr} from "../../../../../service/utils/JsUtils";

const UserSubscribePanel = () => {
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
            userInfoList.map((info)=><UserInfoItem key={info.info.id} info={info.info} share={info.share}/>)
        }</div>
    );
};

export const UserInfoItem = (props:{info: User, share: UserShare})=>{
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const removeUserSubscribe = useRemoveUserSubscribe()
    const visit = useVisit()
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
                <Col span={3} offset={10} className={classes.share_info}>
                    <StarOutlined style={{color: "#"}}/>
                    <span>{statisticDisplayAbbr(props.share.favorites)}</span>
                </Col>
                <Col span={1}>
                    <MinusOutlined
                        className={utils.icon_button}
                        onClick={()=>removeUserSubscribe(selectedKnodeId, props.info.id!)}/>
                </Col>
            </Row>
            <Divider style={{margin:"0.5em"}}/>
        </div>
    )
}

export default UserSubscribePanel;