import React, {useEffect, useState} from 'react';
import {getEnhancerTraceTimeline} from "../../../../../../service/api/TracingApi";
import {useRecoilState, useRecoilValue} from "recoil";
import {SelectedKnodeIdAtom} from "../../../../../../recoil/home/Knode";
import {Col, Row, Slider, Timeline} from "antd";
import {EnhancerTraceTimelineAtom, useTimelineItemToCard} from "./EnhancerTraceTimelineHooks";
import classes from "./EnhancerTraceTimeline.module.css"


const EnhancerTraceTimeline = () => {
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [timeline, setTimeline] = useRecoilState(EnhancerTraceTimelineAtom)
    const [timelineItemCards, setTimelineItemCards] = useState<any[]>([])
    const [minDuration, setMinDuration] = useState(3600)
    const [minInterval, setMinInterval] = useState(3600 * 24 * 7)
    const timelineItemToCard = useTimelineItemToCard()
    useEffect(()=>{
        const effect = async ()=>{
            setTimeline(await getEnhancerTraceTimeline(selectedKnodeId, minDuration, minInterval))
        }; effect().then()
        //eslint-disable-next-line
    }, [minDuration, minInterval])
    useEffect(()=>{
        if(!timeline) return
        setTimelineItemCards(
            timeline.items
                .filter(item=>!!item.enhancer)
                .map((item)=>timelineItemToCard(item)))

        //eslint-disable-next-line
    }, [timeline])
    return (
        <div>
            <Row>
                <Col span={4} offset={1}>
                    <span className={classes.prompt}>最小间隔（天）</span>
                </Col>
                <Col span={16}>
                    <Slider
                        defaultValue={7} min={1} max={30}
                        onChange={(interval)=>setMinInterval(interval * 3600 * 24)}/>
                </Col>
            </Row>
            <Row>
                <Col span={4} offset={1}>
                    <span className={classes.prompt}>最小时长（时）</span>
                </Col>
                <Col span={16}>
                    <Slider
                        defaultValue={1} min={0.1} max={10} step={0.1}
                        onChange={(duration)=>setMinDuration(Math.round(duration * 3600))}/>
                </Col>
            </Row>
            <br/>
            <Row>
                <Col span={22} offset={1}>
                    <Timeline items={timelineItemCards}/>
                </Col>
            </Row>
            <br/>
        </div>
    );
};

export default EnhancerTraceTimeline;