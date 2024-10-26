import React, {useEffect, useState} from 'react';
import {Col, Dropdown, Input, Popover, Row, TimePicker, Tooltip} from "antd";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    CurrentStudyAtom, useAddEnhancerId,
    useCalculateDuration, useContinueCurrentStudy, useLastStudyInfo, usePauseCurrentStudy,
    useRemoveCurrentStudy, useRemoveEnhancerId,
    useSetTitle, useSettleCurrentStudy, useStartStudy
} from "./CurrentStudyRecordHooks";
import {
    editCurrentStudyTitle,
    getCurrentStudy, updateDurationOffset,
    updateStartTime
} from "../../../../../service/api/TracingApi";
import classes from "./CurrentStudyRecord.module.css"
import utils from "../../../../../utils.module.css"
import {formatMillisecondsToHHMMSS} from "../../../../../service/utils/TimeUtils";
import {ContinueOutlined, FinishedOutlined, PauseOutlined} from "../../../../utils/antd/icons/Icons";
import {
    CalendarOutlined,
    DeleteOutlined, DownOutlined,
    EditOutlined,
    MinusOutlined,
    SettingOutlined, UpOutlined
} from "@ant-design/icons";
import {SelectedKnodeIdAtom} from "../../../../../recoil/home/Knode";
import {Enhancer} from "../../../../../service/data/Enhancer";
import {EnhancersForSelectedKnodeAtom} from "../../../../../recoil/home/Enhancer";
import {getEnhancerById, getEnhancersForKnode} from "../../../../../service/api/EnhancerApi";
import dayjs from "dayjs";
import {DEFAULT_DATE_TIME_PATTERN} from "../../../../../service/utils/constants";
import {LoadedTracesAtom} from "../HistoryStudyRecord/HistoryStudyRecordHooks";

const CurrentStudyRecord = () => {
    const [currentStudy, setCurrentStudy] = useRecoilState(CurrentStudyAtom)
    const startStudy = useStartStudy()
    const removeCurrentStudy = useRemoveCurrentStudy()
    const settleCurrentStudy = useSettleCurrentStudy()
    const pauseCurrentStudy = usePauseCurrentStudy()
    const continueCurrentStudy = useContinueCurrentStudy()
    const [loadedTraces,] = useRecoilState(LoadedTracesAtom)
    const calculateDuration = useCalculateDuration()
    const setTitle = useSetTitle()
    const [timerKey, setTimerKey] = useState(0)
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [enhancers, setEnhancers] = useRecoilState<Enhancer[]>(EnhancersForSelectedKnodeAtom)
    const lastStudyInfo = useLastStudyInfo()
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
    useEffect(()=>{
        const effect= async ()=>{
            currentStudy && await updateDurationOffset(currentStudy!.durationOffset)
        }; effect().then()
        //eslint-disable-next-line
    }, [currentStudy?.durationOffset])
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
                                            [...new Set(loadedTraces.filter(trace=>trace.title && trace.title.trim() !== ""))]
                                            .map(trace=>({
                                                key: trace.id,
                                                label: trace.title,
                                                onClick: ()=>lastStudyInfo(trace)
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
                                {/*{currentEnhancers.length === 0 && <Divider>当前知识点无学习笔记</Divider>}*/}
                                {currentStudy.enhancerIds.map(enhancerId=><PickedEnhancerItem key={enhancerId} enhancerId={enhancerId}/>)}
                                {enhancers
                                    .filter(enhancer=>currentStudy.enhancerIds.indexOf(enhancer.id) === -1)
                                    .map(enhancer=><ToPickEnhancerItem key={enhancer.id} enhancer={enhancer}/>)}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={4} offset={2}>
                            <span
                                className={classes.time_bar}
                                key={timerKey}>{
                                currentStudy.trace.startTime &&
                                formatMillisecondsToHHMMSS(calculateDuration())
                            }</span>
                            </Col>
                            <Col span={16}>
                                <Row className={classes.options}>
                                    <Col span={2}>
                                        <Tooltip title={"时(×1)"}>
                                            <div className={classes.offset_option}>
                                                <UpOutlined
                                                    className={utils.icon_button_normal}
                                                    onClick={()=>setCurrentStudy(cur=>({...cur!, durationOffset: cur!.durationOffset + 60 * 60}))}/>
                                                <DownOutlined
                                                    className={utils.icon_button_normal}
                                                    onClick={()=>setCurrentStudy(cur=>({...cur!, durationOffset: cur!.durationOffset - 60 * 60}))}/>
                                            </div>
                                        </Tooltip>
                                    </Col>
                                    <Col span={2}>
                                        <Tooltip title={"分(×5)"}>
                                            <div className={classes.offset_option}>
                                                <UpOutlined
                                                    className={utils.icon_button_normal}
                                                    onClick={()=>setCurrentStudy(cur=>({...cur!, durationOffset: cur!.durationOffset + 5 * 60}))}/>
                                                <DownOutlined
                                                    className={utils.icon_button_normal}
                                                    onClick={()=>setCurrentStudy(cur=>({...cur!, durationOffset: cur!.durationOffset - 5 * 60}))}/>
                                            </div>
                                        </Tooltip>
                                    </Col>
                                    <Col span={2}>
                                        <Tooltip title={"秒(×10)"}>
                                            <div className={classes.offset_option}>
                                                <UpOutlined
                                                    className={utils.icon_button_normal}
                                                    onClick={()=>setCurrentStudy(cur=>({...cur!, durationOffset: cur!.durationOffset + 10}))}/>
                                                <DownOutlined
                                                    className={utils.icon_button_normal}
                                                    onClick={()=>setCurrentStudy(cur=>({...cur!, durationOffset: cur!.durationOffset - 10}))}/>
                                            </div>
                                        </Tooltip>
                                    </Col>
                                    <Col span={3}>
                                        <Popover
                                            content={(
                                            <div style={{width: "18em"}}>
                                                <Row>
                                                    <Col span={7}>
                                                        <span className={classes.edit_time}>    起始时间</span>
                                                    </Col>
                                                    <Col span={16} offset={1}>
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
                                            </div>)}>
                                            <SettingOutlined className={utils.icon_button}/>
                                        </Popover>
                                    </Col>
                                    <Col span={3}>
                                        <div className={classes.pause_and_continue}>{
                                            currentStudy.pauseList.length > currentStudy.continueList.length ?
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
                                    <Col span={3}>
                                        <DeleteOutlined
                                            className={utils.icon_button}
                                            onClick={()=>removeCurrentStudy()}/>
                                    </Col>
                                    <Col span={3}>
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

const PickedEnhancerItem = (props:{enhancerId: number})=>{
    const removeEnhancerId = useRemoveEnhancerId()
    const [enhancer, setEnhancer] = useState<Enhancer>()
    useEffect(()=>{
        const effect = async ()=>{
            setEnhancer(await getEnhancerById(props.enhancerId))
        }; effect().then()
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