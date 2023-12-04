import React, {useEffect, useState} from 'react';
import {Col, Row, Tooltip} from "antd";
import utils from "../../../../../../utils.module.css"
import general from "../Player.module.css"
import {FileTextFilled, FileTextOutlined} from "@ant-design/icons";
import {MilkdownProvider} from "@milkdown/react";
import {MilkdownEditor} from "../../../../../utils/markdown/MilkdownEditor";
import milkdown from "../../../../../utils/markdown/MarkdownBasic.module.css"
import {addDataToResource, getAllDataFromResource} from "../../../../../../service/api/ResourceApi";
import {LatexDarkOutlined, LatexLightOutlined} from "../../../../../utils/antd/icons/Icons";
import {Resource} from "../../EnhancerCard/EnhancerCardHooks";
import PlainLoading from "../../../../../utils/general/PlainLoading";
import {useRecoilValue} from "recoil";
import {CurrentTabAtom} from "../../../InfoRightHooks";
import {base64DecodeUtf8} from "../../../../../../service/utils/JsUtils";
import dayjs from "dayjs";
import axios from "axios";
import {ENHANCER_HOST} from "../../../../../../service/api/EnhancerApi";
import {updateImage} from "../ResourcePlayerUtils";

const MarkdownPlayer = (props: {meta: Resource, readonly? : boolean}) => {

    const [data, setData ] = useState({content: "", config: {hide: false, latexDisplayMode: true}})
    const [loading, setLoading] = useState(true)
    const [editorKey, setEditorKey] = useState(0)
    const currentTab = useRecoilValue(CurrentTabAtom)
    const [hide, setHide] = useState<boolean>()
    useEffect(()=>{
        setHide(currentTab === "analysis")
    },[currentTab])
    useEffect(()=>{
        setEditorKey(editorKey+1)
        //eslint-disable-next-line
    },[data.config.latexDisplayMode])
    useEffect(()=>{
        const init = async ()=>{
            let resp = await getAllDataFromResource(props.meta.id!)
            try {
                const content = base64DecodeUtf8(resp["content.md"])
                const config = JSON.parse(base64DecodeUtf8(resp["config.json"]))
                setData({config: config, content: content})
            }catch (err){
                await addDataToResource(props.meta.id!, "content.md", " ")
                await addDataToResource(props.meta.id!, "config.json", JSON.stringify(data.config))
                resp = await getAllDataFromResource(props.meta.id!)
                const content = base64DecodeUtf8(resp["content.md"])
                const config = JSON.parse(base64DecodeUtf8(resp["config.json"]))
                setData({config: config, content: content})
            }
            setLoading(false)
        }; init()
        //eslint-disable-next-line
    },[])

    if(loading) return <PlainLoading/>
    return (
        <div
            className={general.container} tabIndex={0}
            onBlur={()=>!props.readonly && addDataToResource(props.meta.id!, "content.md", data.content)}>
            <Row>
                <Col span={1} className={general.sidebar}>{
                    hide ?
                        <FileTextFilled
                            className={utils.icon_button}
                            onClick={()=>setHide(false)}/>:
                        <FileTextOutlined
                            className={utils.icon_button}
                            onClick={()=>setHide(true)}/>
                    }<br/>{
                        !props.readonly && (
                        data.config.latexDisplayMode ?
                            <Tooltip title={"切换为行内模式"}>
                                <LatexDarkOutlined
                                    className={utils.icon_button}
                                    onClick={()=>{
                                        const newValue = {...data, config: {...data.config, latexDisplayMode: false}};
                                        setData(newValue)
                                        !props.readonly && addDataToResource(props.meta.id!, "config.json" , JSON.stringify(newValue.config))
                                    }}/>
                            </Tooltip> :
                            <Tooltip title={"切换为段落模式"}>
                                <LatexLightOutlined
                                    className={utils.icon_button}
                                    onClick={()=>{
                                        const newValue = {...data, config: {...data.config, latexDisplayMode: true}};
                                        setData(newValue)
                                        !props.readonly && addDataToResource(props.meta.id!,"config.json" , JSON.stringify(newValue.config))
                                    }}/>
                            </Tooltip>
                    )
                }</Col>
                <Col span={22} offset={1}>{
                    hide ?
                        <div style={{width: "100%"}}>
                            <span className={general.placeholder}> 知识概述 . . . </span>
                        </div>:
                        <>
                            {data.content.trim().length === 0 && <span className={general.placeholder}>知识概述 . . . </span>}
                            <div className={milkdown.markdown} key={editorKey}>
                                <MilkdownProvider>
                                    <MilkdownEditor
                                        md={data.content}
                                        editable={!props.readonly}
                                        latexDisplayMode={data.config.latexDisplayMode}
                                        onChange={cur=>setData({...data, content: cur})}
                                        updateImage={(image)=>updateImage(image, props.meta.id!)}/>
                                </MilkdownProvider>
                            </div>
                        </>
                }</Col>
            </Row>
        </div>
    );
};

export default MarkdownPlayer;