import React, {useEffect, useState} from 'react';
import {Breadcrumb, Col, Divider, Dropdown, Input, Popover, Row, TimePicker} from "antd";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    CurrentStudyAtom, useAddEnhancerId,
    useAddKnodeId, useCalculateDuration, useContinueCurrentStudy, usePauseCurrentStudy,
    useRemoveCurrentStudy, useRemoveEnhancerId,
    useRemoveKnodeId, useSetTitle, useSettleCurrentStudy, useStartStudy
} from "./CurrentStudyRecordHooks";
import {
    editCurrentStudyTitle,
    getCurrentStudy,
    updateEndTime,
    updateStartTime
} from "../../../../../service/api/TracingApi";
import classes from "./CurrentStudyRecord.module.css"
import utils from "../../../../../utils.module.css"
import {formatMillisecondsToHHMMSS} from "../../../../../service/utils/TimeUtils";
import {ContinueOutlined, FinishedOutlined, PauseOutlined} from "../../../../utils/antd/icons/Icons";
import {CalendarOutlined, DeleteOutlined, EditOutlined, MinusOutlined, SettingOutlined} from "@ant-design/icons";
import {KnodeSelector, SelectedKnodeIdAtom, SelectedKnodeSelector} from "../../../../../recoil/home/Knode";
import {breadcrumbTitle} from "../../../../../service/data/Knode";
import {getChainStyleTitle} from "../../../../../service/api/KnodeApi";
import {Enhancer} from "../../../../../service/data/Enhancer";
import {EnhancersForSelectedKnodeAtom} from "../../../../../recoil/home/Enhancer";
import {getEnhancerById, getEnhancersForKnode} from "../../../../../service/api/EnhancerApi";
import dayjs from "dayjs";
import {DEFAULT_DATE_TIME_PATTERN} from "../../../../../service/utils/constants";
import {StudyTracesAtom} from "../HistoryStudyRecord/HistoryStudyRecordHooks";

const CurrentStudyRecord = () => {
    const [currentStudy, setCurrentStudy] = useRecoilState(CurrentStudyAtom)
    const startStudy = useStartStudy()
    const removeCurrentStudy = useRemoveCurrentStudy()
    const settleCurrentStudy = useSettleCurrentStudy()
    const pauseCurrentStudy = usePauseCurrentStudy()
    const continueCurrentStudy = useContinueCurrentStudy()
    const [studyTraces,] = useRecoilState(StudyTracesAtom)
    const calculateDuration = useCalculateDuration()
    const setTitle = useSetTitle()
    const [timerKey, setTimerKey] = useState(0)
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const selectedKnode = useRecoilValue(SelectedKnodeSelector)
    const [enhancers, setEnhancers] = useRecoilState<Enhancer[]>(EnhancersForSelectedKnodeAtom)
    useEffect(()=>{
        const effect = async ()=>{
            if(!selectedKnodeId) return
            setEnhancers(await getEnhancersForKnode(selectedKnodeId))
        }; effect().then()
        //eslint-disable-next-line
    }, [selectedKnodeId])
    useEffect(()=>{
        const effect = async ()=>{
            setCurrentStudy(await getCurrentStudy())
        }; effect().then()
        //eslint-disable-next-line
    }, [])
    useEffect(()=>{
        setTimeout(()=>setTimerKey(timerKey + 1), 1000)
    }, [timerKey])
    useEffect(()=>{
        if(currentStudy)
            document.title = "Mindtrace Cloud 学习中..."
        else document.title = "Mindtrace Cloud"
    }, [currentStudy])
    return (
        <div>
            <Row>
                <Col span={22} offset={1}>{
                    !currentStudy &&
                    <Row>
                        <Col span={24}>
                            <span className={classes.start_prompt} onClick={()=>startStudy()}>开始学习</span>
                        </Col>
                    </Row>}{
                    currentStudy &&
                    <>
                        <Row>
                            <Col span={1}>
                                <Dropdown
                                    arrow={false}
                                    menu={{
                                        items:
                                            [...new Set(
                                                studyTraces
                                                .filter(trace=>trace.title && trace.title.trim() !== "")
                                                .map(trace=>trace.title))]
                                            .map(title=>({
                                                key: title,
                                                label: title,
                                                onClick: async ()=> {
                                                    setTitle(title)
                                                    await editCurrentStudyTitle(title)
                                                }
                                            }))
                                            .splice(0,5)}}>
                                    <CalendarOutlined className={`${utils.icon_button} ${classes.current_left_option}`}/>
                                </Dropdown>
                            </Col>
                            <Col span={23}>
                                <Input
                                    value={currentStudy.trace.title}
                                    onChange={({target: {value}})=>setTitle(value)}
                                    onBlur={()=>currentStudy.trace.title && editCurrentStudyTitle(currentStudy.trace.title)}
                                    bordered={false}
                                    className={classes.title}
                                    placeholder={"标题 . . ."}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                {currentStudy.knodeIds.map(knodeId=><PickedKnodeItem key={knodeId} knodeId={knodeId}/>)}
                                {[selectedKnodeId, ...selectedKnode?.branchIds!].map((knodeId)=>(<ToPickKnodeItem knodeId={knodeId} key={knodeId}/>))}
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
                                        <Popover
                                            content={(
                                            <div style={{width: "24em"}}>
                                                <Row>
                                                    <Col span={6}>
                                                        <span className={classes.edit_time}>设置起始时间</span>
                                                    </Col>
                                                    <Col span={16} offset={2}>
                                                        <TimePicker
                                                            size={"small"} defaultValue={dayjs(currentStudy.trace.startTime)}
                                                            onChange={async (time)=>{
                                                                if(!time) return
                                                                const startTime = time.format(DEFAULT_DATE_TIME_PATTERN);
                                                                setCurrentStudy({...currentStudy, trace: {...currentStudy?.trace, startTime: startTime}})
                                                                await updateStartTime(startTime)
                                                            }}/>
                                                    </Col>
                                                </Row>
                                                <Divider/>
                                                <Row>
                                                    <Col span={6}>
                                                        <span className={classes.edit_time}>设置结束时间</span>
                                                    </Col>
                                                    <Col span={16} offset={2}>
                                                        <TimePicker
                                                            size={"small"} defaultValue={dayjs()}
                                                            onChange={async (time)=>{
                                                                if(!time) return
                                                                const endTime = time.format(DEFAULT_DATE_TIME_PATTERN);
                                                                setCurrentStudy({...currentStudy, trace: {...currentStudy?.trace, endTime: endTime}})
                                                                await updateEndTime(endTime)
                                                            }}/>
                                                    </Col>
                                                </Row>
                                            </div>)}>
                                            <SettingOutlined className={utils.icon_button}/>
                                        </Popover>
                                    </Col>
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
        }; effect().then()
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

const ToPickKnodeItem = (props:{knodeId: number})=>{
    const [knode,] = useRecoilState(KnodeSelector(props.knodeId))
    const [chainStyleTitle, setChainStyleTitle] = useState<string[]>([])
    const addKnodeId = useAddKnodeId(props.knodeId)
    const currentStudy = useRecoilValue(CurrentStudyAtom)

    useEffect(()=>{
        const effect = async ()=>{
            setChainStyleTitle(await getChainStyleTitle(props.knodeId))
        }; effect().then()
        //eslint-disable-next-line
    }, [knode])

    if(!currentStudy) return <></>
    if(!knode) return <></>
    if(currentStudy.knodeIds.find(knodeId=>knodeId === knode.id)) return <></>
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