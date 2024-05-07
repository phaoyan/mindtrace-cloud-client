import React, {useEffect, useState} from 'react';
import {useRecoilValue} from "recoil";
import {CurrentKnodeSubscribesAtom} from "../SharePanelHooks";
import {Avatar, Breadcrumb, Col, Pagination, Row} from "antd";
import {MinusOutlined} from "@ant-design/icons";
import utils from "../../../../../utils.module.css"
import {VisitOutlined} from "../../../../utils/antd/icons/Icons";
import {useRemoveKnodeSubscribe} from "../KnodeShareCard/KnodeShareCardHooks";
import {getChainStyleTitle, getKnodeById} from "../../../../../service/api/KnodeApi";
import {breadcrumbTitle, Knode} from "../../../../../service/data/Knode";
import {getUserPublicInfo} from "../../../../../service/api/LoginApi";
import {User} from "../../../../../service/data/Gateway";
import classes from "./KnodeSubscribePanel.module.css";
import {Enhancer} from "../../../../../service/data/Enhancer";
import {getEnhancersByDateBeneathKnode} from "../../../../../service/api/EnhancerApi";
import {EnhancerCard} from "../../EnhancerPanel/EnhancerCard/EnhancerCard";
import {SelectedKnodeIdAtom} from "../../../../../recoil/home/Knode";
import PlainLoading from "../../../../utils/general/PlainLoading";
import {ReadonlyModeAtom, useVisit} from "../../../Main/MainHooks";

const KnodeSubscribePanel = () => {
    const readonly = useRecoilValue(ReadonlyModeAtom)
    const knodeSubscribes = useRecoilValue(CurrentKnodeSubscribesAtom)
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const removeKnodeSubscribe = useRemoveKnodeSubscribe()
    return (
        <div>{
            knodeSubscribes.map((knodeId)=>(
                <Row key={knodeId}>
                    <Col span={22}>
                        <KnodeSubscribeItem knodeId={knodeId}/>
                    </Col>
                    <Col span={2}>{
                        !readonly &&
                        <MinusOutlined
                            className={utils.icon_button}
                            onClick={()=>removeKnodeSubscribe(selectedKnodeId, knodeId)}/>
                    }</Col>
                </Row>
            ))
        }</div>
    );
};

export const KnodeSubscribeItem = (props:{knodeId:number})=>{
    const [loading, setLoading] = useState(true)
    const [knodeInfo, setKnodeInfo] = useState<Knode>()
    const [chainStyleTitle, setChainStyleTitle] = useState<string[]>()
    const [owner, setOwner] = useState<User>()
    const [recentEnhancers, setRecentEnhancers] = useState<Enhancer[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 3
    const visit = useVisit()
    useEffect(()=>{
        const effect = async ()=>{
            const knode = await getKnodeById(props.knodeId);
            setKnodeInfo(knode)
            setOwner(await getUserPublicInfo(knode.createBy))
            setChainStyleTitle(await getChainStyleTitle(props.knodeId))
            const enhancers = await getEnhancersByDateBeneathKnode(props.knodeId)
            setRecentEnhancers(enhancers.reverse())
            setLoading(false)
        }; effect().then()
    }, [props.knodeId])

    if(!knodeInfo || !owner || !chainStyleTitle) return <></>
    if(loading) return <PlainLoading/>
    return (<div>
        <Row>
            <Col span={1} offset={1}>
                <VisitOutlined
                    className={`${utils.icon_button} ${classes.enter_icon}`}
                    onClick={()=>visit(owner, knodeInfo?.id)}/>
            </Col>
            <Col span={1}>
                <Avatar shape={"circle"} src={owner.avatar}/>
            </Col>
            <Col span={20} offset={1}>
                <Breadcrumb
                    className={classes.title}
                    items={breadcrumbTitle(chainStyleTitle, true)}/>
            </Col>
        </Row>
        <br/>
        <Row>
            <Col span={22} offset={1}>{
                    recentEnhancers
                        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                        .map(enhancer=><EnhancerCard id={enhancer.id} readonly={true} key={enhancer.id}/>)
                }<Pagination
                onChange={(page)=>setCurrentPage(page)}
                defaultCurrent={currentPage}
                total={recentEnhancers.length}
                hideOnSinglePage={true}
                pageSize={pageSize}/>
            </Col>
        </Row>
    </div>)
}

export default KnodeSubscribePanel;