import React, {useEffect, useState} from 'react';
import {Col, Row, Tag, Timeline, TimelineItemProps} from "antd";
import {useRecoilValue} from "recoil";
import {getKnode, KtreeAtom, SelectedKnodeIdAtom} from "../../../../recoil/home/Knode";
import {UserID} from "../../../../recoil/User";
import {
    getKnodeRelatedLearningTrace,
    getRelatedKnodeIdsOfLearningTrace,
    removeLearningTraceById
} from "../../../../service/api/TracingApi";
import {LearningTrace, WrappedLearningTrace} from "../../../../service/data/Mindtrace";
import {calculateDuration} from "../../../../service/data/Mindtrace";
import {getEnhancerById} from "../../../../service/api/EnhancerApi";
import classes from "./LearningTraceTimeline.module.css"
import utils from "../../../../utils.module.css"
import MdPreview from "../../../utils/markdown/MdPreview";
import {MinusOutlined} from "@ant-design/icons";
import {LearningTraceSubmitSignalAtom} from "../../../../recoil/home/Mindtrace";

const LearningTraceTimeline = () => {

    const userId = useRecoilValue(UserID)
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const ktree = useRecoilValue(KtreeAtom)
    const [wrappedTraces, setWrappedTraces] = useState<WrappedLearningTrace[]>([]);
    const [timelineItems, setTimelineItems] = useState<TimelineItemProps[]>()

    const wrapTrace = async (learningTrace: LearningTrace): Promise<WrappedLearningTrace>=>{

        let enhancer = await getEnhancerById(userId, learningTrace.enhancerId)
        let knodeIds = await getRelatedKnodeIdsOfLearningTrace(userId, learningTrace.id)

        return {
            id: learningTrace.id,
            enhancerInfo: {
                id: learningTrace.enhancerId,
                title: enhancer.title
            },
            // @ts-ignore
            knodeInfo: knodeIds.map(id => {
                let knode = getKnode(ktree, id);
                if(knode)
                    return {
                        id: knode.id,
                        title: knode.title
                    }
                else return undefined
            }).filter(info=>info !== undefined),
            duration: calculateDuration(learningTrace),
            createTime: learningTrace.createTime
        }
    }


    const learningTraceSubmitSignal = useRecoilValue(LearningTraceSubmitSignalAtom)
    useEffect(()=>{
        getKnodeRelatedLearningTrace(userId, selectedKnodeId)
            .then(async (data)=>{
            let result: WrappedLearningTrace[] = []
            for(let tr of data)
                await wrapTrace(tr).then((wrapped)=>{
                    result.push(wrapped)
                })
            setWrappedTraces(result)
        })
        // eslint-disable-next-line

    }, [selectedKnodeId, userId, learningTraceSubmitSignal])

    const TimelineItem = (props:{wrappedTrace: WrappedLearningTrace})=>{

        const removeLearningTrace = ()=>{
            removeLearningTraceById(userId, props.wrappedTrace.id)
                .then((success)=>success && setWrappedTraces(wrappedTraces.filter(tr=>tr.id !== props.wrappedTrace.id)))
        }

        return (
            <div>
                <Row>
                    <Col span={22}>
                        <span className={classes.timeline_item_title}>
                            {props.wrappedTrace.enhancerInfo.title}
                        </span>
                        <span className={classes.timeline_item_time}>
                            {props.wrappedTrace.createTime.replace("T"," ")}
                        </span>
                    </Col>
                    <Col span={2}>
                        <MinusOutlined
                            className={utils.icon_button}
                            onClick={()=>removeLearningTrace()}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        {props.wrappedTrace.knodeInfo.map(info=>(
                            <Tag
                                key={info.id}
                                className={classes.knode_tag}
                                bordered={false}>
                                <MdPreview>{info.title}</MdPreview>
                            </Tag>
                        ))}
                    </Col>
                </Row>
            </div>)
    }

    useEffect(()=>{
        setTimelineItems(wrappedTraces.map(tr=>({
            children: <TimelineItem wrappedTrace={tr}/>
        })))
    }, [wrappedTraces])


    if(wrappedTraces.length === 0)
        return <div className={classes.placeholder}>暂无记录</div>
    return (
        <div>
            <Timeline items={timelineItems}/>
        </div>
    );
};

export default LearningTraceTimeline;