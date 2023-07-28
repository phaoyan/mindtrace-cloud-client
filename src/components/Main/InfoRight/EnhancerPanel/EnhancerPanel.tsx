import React, {useEffect, useState} from 'react';
import {useRecoilState, useRecoilValue} from "recoil";
import {DelayedSelectedKnodeIdAtom} from "../../../../recoil/home/Knode";
import {Enhancer} from "../../../../service/data/Enhancer";
import {
    addEnhancerToKnode, copyEnhancer,
    getEnhancersForKnode,
    getEnhancersForOffsprings,
    scissorEnhancer
} from "../../../../service/api/EnhancerApi";
import {Col, Divider, Pagination, Row, Switch, Tooltip} from "antd";
import {CopyOutlined, PlusOutlined, ScissorOutlined} from "@ant-design/icons";
import classes from "./EnhancerPanel.module.css";
import utils from "../../../../utils.module.css"
import {EnhancerCardIdClipboardAtom, EnhancersForSelectedKnodeAtom} from "../../../../recoil/home/Enhancer";
import {EnhancerPanelKeyAtom} from "../../../../recoil/utils/DocumentData";
import {EnhancerCard} from "./EnhancerCard/EnhancerCard";
import {ReadonlyModeAtom} from "../../Main/MainHooks";
import {getEnhancerSubscribes, getKnodeSubscribes, getUserSubscribes} from "../../../../service/api/ShareApi";
import {
    CurrentEnhancerSubscribesAtom,
    CurrentKnodeSubscribesAtom,
    CurrentUserSubscribesAtom
} from "../SharePanel/SharePanelHooks";
import UserSubscribePanel from "../SharePanel/UserSubscribePanel/UserSubscribePanel";
import KnodeSubscribePanel from "../SharePanel/KnodeSubscribePanel/KnodeSubscribePanel";
import EnhancerSubscribePanel from "../SharePanel/EnhancerSubscribePanel/EnhancerSubscribePanel";
const EnhancerPanel = () => {

    const readonly = useRecoilValue(ReadonlyModeAtom)
    const selectedKnodeId = useRecoilValue(DelayedSelectedKnodeIdAtom)
    const [enhancers, setEnhancers] = useRecoilState<Enhancer[]>(EnhancersForSelectedKnodeAtom)
    const [enhancerPanelKey, setEnhancerPanelKey] = useRecoilState(EnhancerPanelKeyAtom)
    const [enhancerIdClipboard, setEnhancerIdClipboard] = useRecoilState(EnhancerCardIdClipboardAtom)
    const [offspringMode, setOffspringMode] = useState<boolean>(false)
    const [offspringEnhancers, setOffspringEnhancers] = useState<Enhancer[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [userSubscribes, setUserSubscribes] = useRecoilState(CurrentUserSubscribesAtom)
    const [knodeSubscribes, setKnodeSubscribes] = useRecoilState(CurrentKnodeSubscribesAtom)
    const [enhancerSubscribes, setEnhancerSubscribes] = useRecoilState(CurrentEnhancerSubscribesAtom)
    const pageSize = 8

    // selectedKnodeId -> enhancers
    useEffect(() => {
        const effect = async ()=>{
            if(!selectedKnodeId) return
            setEnhancers(await getEnhancersForKnode(selectedKnodeId))
            setUserSubscribes(await getUserSubscribes(selectedKnodeId))
            setKnodeSubscribes(await getKnodeSubscribes(selectedKnodeId))
            setEnhancerSubscribes(await getEnhancerSubscribes(selectedKnodeId))
        }; effect()
        // eslint-disable-next-line
    }, [selectedKnodeId, enhancerPanelKey])
    useEffect(()=>{
        const effect = async ()=>{
            if(offspringMode)
                setOffspringEnhancers(await getEnhancersForOffsprings(selectedKnodeId))
        }; effect()
    }, [offspringMode, selectedKnodeId])

    return (
        <div className={classes.container} key={enhancerPanelKey}>
            <div className={classes.subscribe_container}>{
                userSubscribes.length !== 0 &&
                <UserSubscribePanel/>}{
                knodeSubscribes.length !== 0 &&
                <KnodeSubscribePanel/>}{
                enhancerSubscribes.length !== 0 &&
                <EnhancerSubscribePanel/>}{
                userSubscribes.length +
                knodeSubscribes.length +
                enhancerSubscribes.length !== 0 &&
                <Divider>
                    <span className={classes.divider}>
                        以上为订阅内容
                    </span>
                </Divider>
            }</div>

            <div className={classes.main}>{
                (offspringMode ? offspringEnhancers : enhancers)
                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    .map(enhancer=>(
                        <div key={enhancer.id}>
                            <EnhancerCard id={enhancer.id} readonly={offspringMode}/>
                            <Divider/>
                        </div>
                    ))
            }<Pagination
                pageSize={pageSize}
                onChange={(page)=>setCurrentPage(page)}
                current={currentPage}
                hideOnSinglePage={true}
                total={(offspringMode ? offspringEnhancers : enhancers).length}/>
            </div>

            <div className={classes.add_card_wrapper}>
                <Row>
                    <Col span={18}>{
                        !readonly &&
                        <>
                            <PlusOutlined
                                className={utils.icon_button}
                                onClick={async ()=>setEnhancers([...enhancers, await addEnhancerToKnode(selectedKnodeId)])
                                }/>{
                            enhancerIdClipboard &&
                            <>
                                <Tooltip title={"剪切（删除原有笔记）"}>
                                    <ScissorOutlined
                                        className={utils.icon_button}
                                        style={{marginLeft:"2em"}}
                                        onClick={ async ()=>{
                                            await scissorEnhancer(enhancerIdClipboard[0],enhancerIdClipboard[1],selectedKnodeId)
                                            setEnhancerPanelKey(enhancerPanelKey+1)
                                            setEnhancerIdClipboard(undefined)
                                        }}/>
                                </Tooltip>
                                <Tooltip title={"粘贴笔记（不删除原有笔记）"}>
                                    <CopyOutlined
                                        className={utils.icon_button}
                                        style={{marginLeft:"2em"}}
                                        onClick={ async ()=>{
                                            await copyEnhancer(enhancerIdClipboard[0],selectedKnodeId)
                                            setEnhancerPanelKey(enhancerPanelKey+1)
                                            setEnhancerIdClipboard(undefined)
                                        }}/>
                                </Tooltip>
                            </>
                            }<span className={classes.placeholder}>在这里添加笔记 . . . </span>
                        </>
                    }</Col>
                    <Col span={5}>
                        <span className={classes.placeholder}>{
                            offspringMode ?
                                "包括子知识笔记":
                                "仅有自身笔记"
                        }</span>
                    </Col>
                    <Col span={1}>
                        <Switch checked={offspringMode} onChange={(checked)=>setOffspringMode(checked)}/>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default EnhancerPanel;