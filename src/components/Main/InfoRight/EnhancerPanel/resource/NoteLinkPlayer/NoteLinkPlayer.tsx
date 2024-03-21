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
import {NoteLinkAtom} from "./NoteLinkPlayerHooks";
import classes from "./NoteLinkPlayer.module.css"
import utils from "../../../../../../utils.module.css"
import {LinkOutlined, SendOutlined} from "@ant-design/icons";
import {Col, Row} from "antd";
import {getEnhancerByResourceId} from "../../../../../../service/api/EnhancerApi";
import {useJumpToEnhancer} from "../../../RecordPanel/HistoryStudyRecord/HistoryStudyRecordHooks";

const NoteLinkPlayer = (props:{meta: Resource, readonly?: boolean}) => {

    const [data, setData ] = useState<{fromId: number, toId?: number, fromResourceId: number, toResourceId?: number} | undefined>()
    const [loading, setLoading] = useState(true)
    const [displayingResources, setDisplayingResources] = useState<Resource[]>()
    const [link, setLink] = useRecoilState(NoteLinkAtom)
    const jumpToEnhancer = useJumpToEnhancer()

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
                        fromId: (await getEnhancerByResourceId(props.meta.id!)).id,
                        toId: undefined,
                        fromResourceId: props.meta.id,
                        toResourceId: undefined
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
                setDisplayingResources((await getResourcesFromEnhancer(data.toId)).filter(resource=>resource.id !== data.toResourceId))
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
                        onClick={()=>jumpToEnhancer(data.toId!)}/> :
                    <LinkOutlined
                        style={{color: link === data.fromResourceId ? "#44D7C1" : "#666"}}
                        className={utils.icon_button}
                        onClick={async ()=>{
                            if(!link)
                                setLink(data!.fromResourceId)
                            else if(link === data!.fromResourceId)
                                setLink(undefined)
                            else{
                                const linkTemp = link
                                const toIdTemp =  (await getEnhancerByResourceId(linkTemp)).id
                                setLink(undefined)
                                setData({...data, toId: toIdTemp, toResourceId: linkTemp})
                                await addDataToResource(linkTemp, "data.json", {
                                    fromId: toIdTemp,
                                    toId: data.fromId,
                                    fromResourceId: linkTemp,
                                    toResourceId: data.fromResourceId
                                })
                                await addDataToResource(props.meta.id!, "data.json", {
                                    fromId: data.fromId,
                                    toId: toIdTemp,
                                    fromResourceId: data.fromResourceId,
                                    toResourceId: linkTemp
                                })
                            }}}/>
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