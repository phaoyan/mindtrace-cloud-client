import React, {useEffect, useState} from 'react';
import {Breadcrumb, Col, Divider, Input, Row} from "antd";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    CurrentStudyAtom, useAddEnhancerId,
    useAddKnodeId, useCalculateDuration, useContinueCurrentStudy, usePauseCurrentStudy,
    useRemoveCurrentStudy, useRemoveEnhancerId,
    useRemoveKnodeId, useSetTitle, useSettleCurrentStudy, useStartStudy
} from "./CurrentStudyRecordHooks";
import {editCurrentStudyTitle, getCurrentStudy} from "../../../../../service/api/TracingApi";
import classes from "./CurrentStudyRecord.module.css"
import utils from "../../../../../utils.module.css"
import {formatMillisecondsToHHMMSS} from "../../../../../service/utils/TimeUtils";
import {ContinueOutlined, FinishedOutlined, PauseOutlined} from "../../../../utils/antd/icons/Icons";
import {DeleteOutlined, EditOutlined, MinusOutlined} from "@ant-design/icons";
import {
    CurrentChainStyleTitleAtom,
    DelayedSelectedKnodeIdAtom,
    SelectedKnodeSelector
} from "../../../../../recoil/home/Knode";
import {breadcrumbTitle} from "../../../../../service/data/Knode";
import {getChainStyleTitle} from "../../../../../service/api/KnodeApi";
import {Enhancer} from "../../../../../service/data/Enhancer";
import {EnhancersForSelectedKnodeAtom} from "../../../../../recoil/home/Enhancer";
import {getEnhancerById, getEnhancersForKnode} from "../../../../../service/api/EnhancerApi";

const CurrentStudyRecord = () => {
    const [currentStudy, setCurrentStudy] = useRecoilState(CurrentStudyAtom)
    const startStudy = useStartStudy()
    const removeCurrentStudy = useRemoveCurrentStudy()
    const settleCurrentStudy = useSettleCurrentStudy()
    const pauseCurrentStudy = usePauseCurrentStudy()
    const continueCurrentStudy = useContinueCurrentStudy()
    const calculateDuration = useCalculateDuration()
    const setTitle = useSetTitle()
    const [timerKey, setTimerKey] = useState(0)
    const selectedKnodeId = useRecoilValue(DelayedSelectedKnodeIdAtom)
    const [enhancers, setEnhancers] = useRecoilState<Enhancer[]>(EnhancersForSelectedKnodeAtom)
    useEffect(()=>{
        const effect = async ()=>{
            if(!selectedKnodeId) return
            setEnhancers(await getEnhancersForKnode(selectedKnodeId))
        }; effect()
    }, [selectedKnodeId])
    useEffect(()=>{
        const effect = async ()=>{
            setCurrentStudy(await getCurrentStudy())
        }; effect()
        //eslint-disable-next-line
    }, [])
    useEffect(()=>{
        setTimeout(()=>setTimerKey(timerKey + 1), 1000)
    }, [timerKey])
    return (
        <div>
            <Row>
                <Col span={22} offset={1}>{
                    !currentStudy &&
                    <Row>
                        <Col span={24}>
                            <span className={classes.start_prompt} onClick={()=>startStudy()}>开始学习</span>
                        </Col>
                    </Row>
                    }{
                    currentStudy &&
                    <>
                        <Col span={24}>
                            <Input
                                value={currentStudy.trace.title}
                                onChange={({target: {value}})=>setTitle(value)}
                                onBlur={()=>currentStudy.trace.title && editCurrentStudyTitle(currentStudy.trace.title)}
                                bordered={false}
                                className={classes.title}
                                placeholder={"标题 . . ."}/>
                        </Col>
                        <Row>
                            <Col span={24}>{
                                currentStudy.knodeIds.map(knodeId=><PickedKnodeItem key={knodeId} knodeId={knodeId}/>)
                            }<ToPickKnodeItem/>
                            </Col>
                        </Row>
                        <Divider className={utils.small_horizontal_divider}/>
                        <Row>
                            <Col span={24}>{
                                currentStudy.enhancerIds.map(enhancerId=><PickedEnhancerItem key={enhancerId} enhancerId={enhancerId}/>)
                            }{
                                enhancers
                                    .filter(enhancer=>currentStudy.enhancerIds.indexOf(enhancer.id) === -1)
                                    .map(enhancer=><ToPickEnhancerItem key={enhancer.id} enhancer={enhancer}/>)
                            }</Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                            <span
                                className={classes.time_bar}
                                key={timerKey}>{
                                currentStudy.trace.startTime &&
                                formatMillisecondsToHHMMSS(calculateDuration())
                            }</span>
                            </Col>
                            <Col span={16}>
                                <Row className={classes.options}>
                                    <Col span={4}>
                                        <div className={classes.pause_and_continue}>{
                                            currentStudy.trace.pauseList.length > currentStudy.trace.continueList.length ?
                                                <ContinueOutlined
                                                    className={utils.icon_button}
                                                    style={{scale:"250%"}}
                                                    onClick={()=>continueCurrentStudy()}/>:
                                                <PauseOutlined
                                                    className={utils.icon_button}
                                                    style={{scale:"180%"}}
                                                    onClick={()=>pauseCurrentStudy()}/>
                                        }</div>
                                    </Col>
                                    <Col span={4}>
                                        <DeleteOutlined
                                            className={utils.icon_button}
                                            onClick={()=>removeCurrentStudy()}/>
                                    </Col>
                                    <Col span={4}>
                                        <FinishedOutlined
                                            className={utils.icon_button}
                                            style={{color:"#000000", scale:"200%"}}
                                            onClick={settleCurrentStudy}/>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </>
                }</Col>
            </Row>
        </div>
    );
};

const PickedKnodeItem = (props: {knodeId: number})=>{
    const removeKnodeId = useRemoveKnodeId()
    const [chainStyleTitle, setChainStyleTitle] = useState<string[]>([])
    useEffect(()=>{
        const effect = async ()=>{
            setChainStyleTitle(await getChainStyleTitle(props.knodeId))
        }; effect()
    }, [props.knodeId])

    return (
        <Row>
            <Col span={1} offset={1}>
                <MinusOutlined
                    className={utils.icon_button_normal}
                    onClick={()=>removeKnodeId(props.knodeId)}/>
            </Col>
            <Col span={20}>
                <Breadcrumb items={breadcrumbTitle(chainStyleTitle, true)}/>
            </Col>
        </Row>
    )
}

const ToPickKnodeItem = ()=>{
    const [selectedKnode,] = useRecoilState(SelectedKnodeSelector)
    const chainStyleTitle = useRecoilValue(CurrentChainStyleTitleAtom)
    const addKnodeId = useAddKnodeId()
    const currentStudy = useRecoilValue(CurrentStudyAtom)

    if(!currentStudy) return <></>
    if(!selectedKnode) return <></>
    if(currentStudy.knodeIds.find(knodeId=>knodeId === selectedKnode.id)) return <></>
    return (
        <Row>
            <Col span={1} offset={1}>
                <EditOutlined
                    className={utils.icon_button_normal}
                    onClick={()=>addKnodeId()}/>
            </Col>
            <Col span={20}>
                <div className={classes.selected_knode_title}>
                    <Breadcrumb items={breadcrumbTitle(chainStyleTitle, true)}/>
                </div>
            </Col>
        </Row>
    )
}

const PickedEnhancerItem = (props:{enhancerId: number})=>{
    const removeEnhancerId = useRemoveEnhancerId()
    const [enhancer, setEnhancer] = useState<Enhancer>()
    useEffect(()=>{
        const effect = async ()=>{
            setEnhancer(await getEnhancerById(props.enhancerId))
        }; effect()
    }, [props.enhancerId])

    if(!enhancer) return <></>
    return (
        <Row>
            <Col span={1} offset={1}>
                <MinusOutlined
                    className={utils.icon_button_normal}
                    onClick={()=>removeEnhancerId(props.enhancerId)}/>
            </Col>
            <Col span={20}>
                <span>{enhancer.title}</span>
            </Col>
        </Row>
    )
}

const ToPickEnhancerItem = (props:{enhancer: Enhancer}) => {
    const addEnhancerId = useAddEnhancerId()
    return (
        <Row>
            <Col span={1} offset={1}>
                <EditOutlined
                    className={utils.icon_button_normal}
                    onClick={()=>addEnhancerId(props.enhancer.id)}/>
            </Col>
            <Col span={20}>
                <div className={classes.selected_knode_title}>
                    <span>{props.enhancer.title}</span>
                </div>
            </Col>
        </Row>
    )
}

export default CurrentStudyRecord;