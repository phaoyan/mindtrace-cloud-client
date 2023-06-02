import React, {useEffect, useState} from 'react';
import {markdownTemplate, Resource} from "../../../../../service/data/Resource";
import {Col, Row, Tooltip} from "antd";
import utils from "../../../../../utils.module.css"
import general from "./Player.module.css"
import {FileTextFilled, FileTextOutlined} from "@ant-design/icons";
import {MilkdownProvider} from "@milkdown/react";
import {MilkdownEditor} from "../../../../utils/markdown/MilkdownEditor";
import milkdown from "../../../../utils/markdown/MarkdownBasic.module.css"
import {addDataToResource, getAllDataFromResource} from "../../../../../service/api/ResourceApi";
import {LatexDarkOutlined, LatexLightOutlined} from "../../../../utils/antd/icons/Icons";

const MarkdownPlayer = (props: {meta: Resource, readonly? : boolean}) => {

    const [data, setData ] = useState(markdownTemplate(props.meta.createBy).data)
    const [loading, setLoading] = useState(true)

    const [editorKey, setEditorKey] = useState(0)
    useEffect(()=>{
        setEditorKey(editorKey+1)
        //eslint-disable-next-line
    },[data.config.latexDisplayMode])

    useEffect(()=>{
        const init = async ()=>{
            const resp = await getAllDataFromResource(props.meta.id!);
            setData({config: JSON.parse(resp.config), content: resp.content})
            setLoading(false)
        }; init()
        //eslint-disable-next-line
    },[])

    const hotkey = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.shiftKey && event.key === "Enter")
            handleSubmit(props.meta.id!, data)
    }

    const handleSubmit = async (resourceId: number, data: any)=>{
        !props.readonly && await addDataToResource(resourceId, data)
    }

    if(loading) return <></>

    return (
        <div
            className={general.container}
            tabIndex={0}
            onKeyDown={hotkey}
            onBlur={()=>handleSubmit(props.meta.id!, data)}>
            <Row>
                <Col span={1} className={general.sidebar}>
                    {data.config.hide ?
                        <FileTextFilled
                            className={utils.icon_button}
                            onClick={()=> {
                                const newValue = {...data, config: {...data.config, hide: false}}
                                setData(newValue)
                                handleSubmit(props.meta.id!, newValue)
                            }}/>:
                        <FileTextOutlined
                            className={utils.icon_button}
                            onClick={()=> {
                                const newValue = {...data, config: {...data.config, hide: true}}
                                setData(newValue)
                                handleSubmit(props.meta.id!, newValue)
                            }}/>
                    }
                    <br/>
                    {data.config.latexDisplayMode ?
                        <Tooltip title={"切换为行内模式"}>
                            <LatexDarkOutlined
                                className={utils.icon_button}
                                onClick={()=>{
                                    const newValue = {...data, config: {...data.config, latexDisplayMode: false}};
                                    setData(newValue)
                                    handleSubmit(props.meta.id!, newValue)
                                }}/>
                        </Tooltip> :
                        <Tooltip title={"切换为段落模式"}>
                            <LatexLightOutlined
                                className={utils.icon_button}
                                onClick={()=>{
                                    const newValue = {...data, config: {...data.config, latexDisplayMode: true}};
                                    setData(newValue)
                                    handleSubmit(props.meta.id!, newValue)
                                }}/>
                        </Tooltip>
                    }
                </Col>
                <Col span={22} offset={1}>
                    {data.config.hide ?
                        <>
                            <span className={general.placeholder}> 知识概述 . . . </span>
                        </>:
                        <>
                            {data.content === "" && <span className={general.placeholder}>知识概述 . . . </span>}
                            <div className={milkdown.markdown} key={editorKey}>
                                <MilkdownProvider>
                                    <MilkdownEditor
                                        md={data.content}
                                        editable={!props.readonly}
                                        latexDisplayMode={data.config.latexDisplayMode}
                                        onChange={cur=>setData({...data, content: cur})} />
                                </MilkdownProvider>
                            </div>
                        </>
                    }
                </Col>
            </Row>
        </div>
    );
};

export default MarkdownPlayer;