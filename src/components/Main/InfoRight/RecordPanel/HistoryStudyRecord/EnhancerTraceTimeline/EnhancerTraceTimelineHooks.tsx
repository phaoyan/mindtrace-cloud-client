import {atom} from "recoil";
import {Breadcrumb, Col, Row, Tooltip} from "antd";
import dayjs from "dayjs";
import classes from "./EnhancerTraceTimeline.module.css"
import utils from "../../../../../../utils.module.css"
import {formatMillisecondsToHHMM} from "../../../../../../service/utils/TimeUtils";
import {Enhancer} from "../../../../../../service/data/Enhancer";
import {useEffect, useState} from "react";
import {breadcrumbTitle, Knode} from "../../../../../../service/data/Knode";
import {getKnodesByEnhancerId} from "../../../../../../service/api/EnhancerApi";
import {getChainStyleTitle} from "../../../../../../service/api/KnodeApi";
import {useJumpToEnhancer} from "../StudyTraceTimeline/StudyTraceRecordHooks";

export interface EnhancerTraceTimelineItem{
    start: string
    end: string
    enhancerId: number
    enhancer: Enhancer
    duration: number
    periods: number
    traceIds: number[]
}

export interface EnhancerTraceTimeline{
    knodeId: number,
    minInterval: number,
    minDuration: number,
    items: EnhancerTraceTimelineItem[]
}

export const EnhancerTraceTimelineAtom = atom<EnhancerTraceTimeline | undefined>({
    key: "EnhancerTraceTimelineAtom",
    default: undefined
})

export const CurrentTracingEnhancerIdAtom = atom<number | undefined>({
    key: "CurrentTracingEnhancerIdAtom",
    default: undefined
})

export const TimelineItemCard = (props: {item: EnhancerTraceTimelineItem})=>{
    const jumpToEnhancer = useJumpToEnhancer()
    const [knode, setKnode] = useState<Knode>()
    const [chainStyleTitle, setChainStyleTitle] = useState<string[]>([])
    useEffect(()=>{
        const effect = async ()=>{
            const knodes = await getKnodesByEnhancerId(props.item.enhancerId);
            if(knodes.length === 0) return
            setKnode(knodes[0])
        };effect().then()
        //eslint-disable-next-line
    }, [])
    useEffect(()=>{
        const effect = async ()=>{
            if(!knode) return
            setChainStyleTitle(await getChainStyleTitle(knode.id))
        }; effect().then()
    }, [knode])
    return (
        <div>
            <Row>
                <Col span={20}>
                    <span className={classes.date}>
                        {dayjs(props.item.start).format("YYYY-MM-DD")} ~ {dayjs(props.item.end).format("YYYY-MM-DD")}
                    </span>
                </Col>
                <Col span={4}>
                    <span className={classes.duration}>
                        {formatMillisecondsToHHMM(props.item.duration * 1000)}
                    </span>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Breadcrumb items={breadcrumbTitle(chainStyleTitle, true)}/>
                </Col>
            </Row>
            <Row style={{marginTop:"0.5em"}}>
                <Col span={20}>
                    <Tooltip title={"点击跳转"}>
                        <span
                            className={`${classes.title} ${utils.icon_button}`}
                            onClick={()=>jumpToEnhancer(props.item.enhancer.id)}>
                            {props.item.enhancer.title}
                        </span>
                    </Tooltip>
                </Col>
            </Row>
        </div>
    )
}

export const useTimelineItemToCard = ()=>{
    return (item: EnhancerTraceTimelineItem)=>{
        return {
            children: <TimelineItemCard item={item}/>
        }
    }
}

export const useCalculateDayCoordinate = ()=>{
    return (start: string, daysPerLine: number, date: string): number[]=>{
        const diff = dayjs(date).diff(start, "day")
        const r = Math.floor(diff / daysPerLine)
        const c = r % 2 === 1 ? daysPerLine - diff % daysPerLine - 1 : diff % daysPerLine
        // 第一个为第几行，第二个为该行的第几个
        return [r, c]
    }
}