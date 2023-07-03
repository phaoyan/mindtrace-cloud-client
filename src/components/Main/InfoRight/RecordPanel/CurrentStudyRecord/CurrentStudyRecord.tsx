import React, {useEffect, useState} from 'react';
import {Breadcrumb, Col, Input, Row} from "antd";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    CurrentStudyAtom,
    useAddTraceCoverage, useCalculateDuration, useContinueCurrentStudy, usePauseCurrentStudy,
    useRemoveCurrentStudy,
    useRemoveTraceCoverage, useSetTitle, useSettleCurrentStudy, useStartStudy
} from "./CurrentStudyRecordHooks";
import {editCurrentStudyTitle, getCurrentStudy} from "../../../../../service/api/TracingApi";
import classes from "./CurrentStudyRecord.module.css"
import utils from "../../../../../utils.module.css"
import {formatMillisecondsToHHMMSS} from "../../../../../service/utils/TimeUtils";
import {ContinueOutlined, FinishedOutlined, PauseOutlined} from "../../../../utils/antd/icons/Icons";
import {DeleteOutlined, EditOutlined, MinusOutlined} from "@ant-design/icons";
import {CurrentChainStyleTitleAtom, SelectedKnodeSelector} from "../../../../../recoil/home/Knode";
import {breadcrumbTitle} from "../../../../../service/data/Knode";
import {getChainStyleTitle} from "../../../../../service/api/KnodeApi";

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
                                onBlur={()=>editCurrentStudyTitle(currentStudy.trace.title)}
                                bordered={false}
                                className={classes.title}
                                placeholder={"标题 . . ."}/>
                        </Col>
                        <Row>
                            <Col span={24}>{
                                currentStudy.coverages.map(coverage=><LeafItem key={coverage.knodeId} knodeId={coverage.knodeId}/>)
                            }<SelectedKnodeItem/>
                            </Col>
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

const LeafItem = (props: {knodeId: number})=>{
    const removeTraceCoverage = useRemoveTraceCoverage()
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
                    onClick={()=>removeTraceCoverage(props.knodeId)}/>
            </Col>
            <Col span={20}>
                <Breadcrumb items={breadcrumbTitle(chainStyleTitle, true)}/>
            </Col>
        </Row>
    )
}

const SelectedKnodeItem = ()=>{
    const [selectedKnode,] = useRecoilState(SelectedKnodeSelector)
    const chainStyleTitle = useRecoilValue(CurrentChainStyleTitleAtom)
    const addTraceCoverage = useAddTraceCoverage()
    const currentStudy = useRecoilValue(CurrentStudyAtom)

    if(!currentStudy) return <></>
    if(!selectedKnode) return <></>
    if(currentStudy.coverages.find(coverage=>coverage.knodeId === selectedKnode.id)) return <></>
    return (
        <Row>
            <Col span={1} offset={1}>
                <EditOutlined
                    className={utils.icon_button_normal}
                    onClick={()=>addTraceCoverage()}/>
            </Col>
            <Col span={20}>
                <div className={classes.selected_knode_title}>
                    <Breadcrumb items={breadcrumbTitle(chainStyleTitle, true)}/>
                </div>
            </Col>
        </Row>
    )
}

export default CurrentStudyRecord;