import React, {useEffect, useState} from 'react';
import {Resource, ResourcePlayer} from "../../EnhancerCard/EnhancerCardHooks";
import {
    addDataToResource,
    getAllDataFromResource,
    getResourcesFromEnhancer
} from "../../../../../../service/api/ResourceApi";
import {base64DecodeUtf8} from "../../../../../../service/utils/JsUtils";
import PlainLoading from "../../../../../utils/general/PlainLoading";
import {useRecoilState} from "recoil";
import {NoteLinkAtom, NoteLinkDataAtomFamily, useJumpToMilestone, useLinkNote} from "./NoteLinkPlayerHooks";
import classes from "./NoteLinkPlayer.module.css"
import utils from "../../../../../../utils.module.css"
import {LinkOutlined, SendOutlined} from "@ant-design/icons";
import {Col, Row} from "antd";
import {getEnhancerByResourceId} from "../../../../../../service/api/EnhancerApi";
import {CurrentTabAtom} from "../../../InfoRightHooks";
import {getMilestoneByResourceId, getResourcesFromMilestone} from "../../../../../../service/api/TracingApi";
import {useJumpToEnhancer} from "../../../RecordPanel/HistoryStudyRecord/StudyTraceTimeline/StudyTraceRecordHooks";

const NoteLinkPlayer = (props:{meta: Resource, readonly?: boolean}) => {

    const [data, setData ] = useRecoilState(NoteLinkDataAtomFamily(props.meta.id!))
    const [loading, setLoading] = useState(true)
    const [displayingResources, setDisplayingResources] = useState<Resource[]>()
    const [link, ] = useRecoilState(NoteLinkAtom)
    const [currentTab, ] = useRecoilState(CurrentTabAtom);
    const jumpToEnhancer = useJumpToEnhancer()
    const jumpToMilestone = useJumpToMilestone()
    const linkNote = useLinkNote(props.meta.id!)

    useEffect(()=>{
        const init = async ()=>{
            let resp = await getAllDataFromResource(props.meta.id!)
            try {
                setData(JSON.parse(base64DecodeUtf8(resp["data.json"])))
            }catch (err){
                await addDataToResource(
                    props.meta.id!,
                    "data.json",
                    JSON.stringify({
                        fromId: currentTab === "note" ?
                            (await getEnhancerByResourceId(props.meta.id!)).id :
                            (await getMilestoneByResourceId(props.meta.id!)).id,
                        toId: undefined,
                        fromResourceId: props.meta.id,
                        toResourceId: undefined,
                        fromType: currentTab === "note" ? "enhancer" : "milestone",
                        toType: undefined
                    }))
                resp = await getAllDataFromResource(props.meta.id!)
                setData(JSON.parse(base64DecodeUtf8(resp["data.json"])))
            }
            setLoading(false)
        }; init().then()
        //eslint-disable-next-line
    }, [])
    useEffect(()=>{
        const effect = async ()=>{
            if(data && data.toId && data.toResourceId)
                setDisplayingResources(
                    (data.toType === "enhancer" ? await getResourcesFromEnhancer(data.toId) : await getResourcesFromMilestone(data.toId))
                    .filter(resource=>resource.id !== data.toResourceId))
        }; effect().then()
    }, [data])


    if(loading || !data) return <PlainLoading/>
    return (
        <div className={classes.container}>
            <Row>
                <Col span={1} offset={1}>{
                    data.toId ?
                    <SendOutlined
                        className={utils.icon_button}
                        onClick={()=>data.toType === "enhancer" ? jumpToEnhancer(data.toId!) : jumpToMilestone(data.toId!)}/> :
                    <LinkOutlined
                        style={{color: link?.resourceId === data.fromResourceId ? "#44D7C1" : "#666"}}
                        className={utils.icon_button}
                        onClick={()=>linkNote()}/>
                }</Col>
                <Col span={22}>{
                    data.toId ?
                        <div>{
                            displayingResources?.map(resource=><ResourcePlayer resource={resource} readonly={true} key={resource.id}/>)
                        }</div> :
                        <span className={classes.prompt}>点击左边按钮→在另一笔记中创建笔记链接→点击其左侧按钮，可将两笔记连接起来</span>
                }</Col>
            </Row>
        </div>
    );
};

export default NoteLinkPlayer;