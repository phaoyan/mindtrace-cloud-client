import React, {useEffect, useState} from 'react';
import {getEnhancerTraceTimeline} from "../../../../../../service/api/TracingApi";
import {useRecoilState, useRecoilValue} from "recoil";
import {SelectedKnodeIdAtom} from "../../../../../../recoil/home/Knode";
import {Breadcrumb, Col, Popover, Row, Slider} from "antd";
import {
    EnhancerTraceTimelineAtom,
    useCalculateDayCoordinate,
} from "./EnhancerTraceTimelineHooks";
import classes from "./EnhancerTraceTimeline.module.css"
import utils from "../../../../../../utils.module.css"
import {EnvironmentOutlined} from "@ant-design/icons";
import {useJumpToEnhancer} from "../HistoryStudyRecordHooks";
import dayjs from "dayjs";
import {getKnodesByEnhancerId} from "../../../../../../service/api/EnhancerApi";
import {getChainStyleTitle} from "../../../../../../service/api/KnodeApi";
import {breadcrumbTitle} from "../../../../../../service/data/Knode";
import {formatMillisecondsToHHMM} from "../../../../../../service/utils/TimeUtils";


const EnhancerTraceTimeline = () => {
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [timeline, setTimeline] = useRecoilState(EnhancerTraceTimelineAtom)
    const [minDuration, setMinDuration] = useState(3600)
    const [minInterval, setMinInterval] = useState(3600 * 24 * 7)
    const [daysPerRow, setDaysPerRow] = useState(7)
    const [datesGroupedByRow, setDatesGroupedByRow] = useState(new Map())
    const calculateDayCoordinate = useCalculateDayCoordinate()
    useEffect(()=>{
        const effect = async ()=>{
            setTimeline(await getEnhancerTraceTimeline(selectedKnodeId, minDuration, minInterval))
        }; effect().then()
        //eslint-disable-next-line
    }, [minDuration, minInterval, selectedKnodeId])
    useEffect(()=>{
        if(!timeline || timeline.items.length === 0) return
        const temp = new Map()
        for(let item of timeline.items){
            const [startRow, startCol] = calculateDayCoordinate(timeline.items[0].start, daysPerRow, item.start);
            const [endRow, endCol] = calculateDayCoordinate(timeline.items[0].start, daysPerRow, item.end);
            const start = {isStart: true, row: startRow, col: startCol, item: item}
            const end = {isStart: false, row: endRow, col: endCol, item: item}
            !temp.get(startRow) ? temp.set(startRow, [start]) : temp.get(startRow).push(start);
            !temp.get(endRow) ? temp.set(endRow, [end]) : temp.get(endRow).push(end);
        }
        setDatesGroupedByRow(temp)
        //eslint-disable-next-line
    }, [timeline, daysPerRow])

    if(!timeline) return <></>
    return (
        <div>
            <Row>
                <Col span={4} offset={1}>
                    <span className={classes.prompt}>最小间隔（天）</span>
                </Col>
                <Col span={16}>
                    <Slider
                        defaultValue={7} min={1} max={30}
                        onAfterChange={(interval)=>setMinInterval(interval * 3600 * 24)}/>
                </Col>
            </Row>
            <Row>
                <Col span={4} offset={1}>
                    <span className={classes.prompt}>最小时长（时）</span>
                </Col>
                <Col span={16}>
                    <Slider
                        defaultValue={1} min={0.1} max={10} step={0.1}
                        onAfterChange={(duration)=>setMinDuration(Math.round(duration * 3600))}/>
                </Col>
            </Row>
            <Row>
                <Col span={4} offset={1}>
                    <span className={classes.prompt}>行天数</span>
                </Col>
                <Col span={16}>
                    <Slider
                        defaultValue={7} min={7} max={30}
                        onAfterChange={(days)=>setDaysPerRow(days)}/>
                </Col>
            </Row>
            <br/>
            <Row>
                <Col span={23} offset={1}>{
                    [...datesGroupedByRow.keys()]
                    .sort((a,b)=>a-b)
                    .map((i)=>(
                       <div key={i}>
                           <RowLayer info={datesGroupedByRow.get(i) || []} length={daysPerRow}/>
                           <RowArrow
                               isRight={i % 2 === 0}
                               time_stamp={dayjs(timeline?.items[0].start).add(i * daysPerRow, "day").format("YYYY-MM-DD")}/>
                       </div>
                    ))
                }</Col>
            </Row>
        </div>
    );
};

export const RowLayer = (props:{info: any[], length: number})=>{
    const [datesGroupedByCol, setDatesGroupedByCol] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const jumpToEnhancer = useJumpToEnhancer()
    const [currentItemEnhancerId, setCurrentItemEnhancerId] = useState<number>()
    useEffect(()=>{
        const temp: any[] = []
        for(let i = 0; i < props.length; i ++){
            temp.push([])
            for(let item of props.info)
                if(item.col === i)
                    temp[i].push(item)
        }
        setDatesGroupedByCol(temp)
        //eslint-disable-next-line
    }, [props.info])
    useEffect(()=>{
        if(datesGroupedByCol.length === 0) return
        setLoading(false)
    }, [datesGroupedByCol])
    if(loading) return <></>
    try {
        return (
            <div className={`${classes.row_layer}`}>{
                    Array
                        .from({length: props.length || 0}, (_, i) => i)
                        .map((i)=>(
                            <div key={i} className={classes.row_layer_cell}>{
                                datesGroupedByCol[i].map((item: any, j: number)=>(
                                    <div key={j}>
                                        <Popover
                                            placement={"topRight"}
                                            content={<EnhancerRelatedKnodeTitleBreadcrumb enhancerId={item.item.enhancerId}/>}>
                                            <EnvironmentOutlined
                                                className={utils.icon_button}
                                                style={{color: item.item.enhancerId === currentItemEnhancerId ? "#ab7a5a" : item.isStart ? "#e0e7c8" : "#90b28d", scale:"120%"}}
                                                onClick={()=>jumpToEnhancer(item.item.enhancerId)}/>
                                        </Popover>
                                        &nbsp;
                                        <span
                                            className={classes.cell_enhancer_title}
                                            onMouseEnter={()=>{setCurrentItemEnhancerId(item.item.enhancerId)}}
                                            onMouseLeave={()=>setCurrentItemEnhancerId(undefined)}>
                                            {item.item.enhancer.title}
                                        </span>{
                                        !item.isStart &&
                                        <span className={classes.cell_enhancer_duration}>
                                            &nbsp;
                                            ({formatMillisecondsToHHMM(item.item.duration * 1000)})
                                            &nbsp;
                                        </span>
                                    }</div>
                                ))
                            }</div>
                        ))
            }</div>
        )
    }catch (e){
        return <></>
    }
}

export const RowArrow = (props:{isRight: boolean, time_stamp?: string})=>{
    return (
        <div style={{direction:props.isRight? "ltr":"rtl"}}>
            <span className={classes.time_stamp}>{props.time_stamp}</span>
            <svg
                width="100%" height="6"
                xmlns="http://www.w3.org/2000/svg"
                style={{transform: props.isRight ? "scaleX(-1)" : "scaleX(1)"}}>
                <line x1="1" y1="5" x2="100%" y2="5" stroke="#ddd" strokeWidth="1"  />
                <line x1="0" y1="5" x2="10" y2="0" stroke="#bbb" strokeWidth="1" />
            </svg>
        </div>
    )
}

export const EnhancerRelatedKnodeTitleBreadcrumb = (props:{enhancerId: number})=>{
    const [chainStyleTitle, setChainStyleTitle] = useState<string[]>([])
    useEffect(()=>{
        const effect = async ()=>{
            try {
                setChainStyleTitle(await getChainStyleTitle((await getKnodesByEnhancerId(props.enhancerId))[0].id))
            }catch (e){
                setChainStyleTitle(["相连知识点已被删除"])
            }
        }; effect().then()
    }, [props.enhancerId])

    return (
        <Breadcrumb items={breadcrumbTitle(chainStyleTitle, true)}/>
    )
}


export default EnhancerTraceTimeline;