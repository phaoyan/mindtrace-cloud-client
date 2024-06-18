import React, {useEffect, useState} from 'react';
import {addDataToResource, getAllDataFromResource} from "../../../../../../service/api/ResourceApi";
import classes from "./ClozePlayer.module.css";
import {MilkdownProvider} from "@milkdown/react";
import {MilkdownEditor} from "../../../../../utils/markdown/MilkdownEditor";
import {Col, Row, Tooltip} from "antd";
import general from "../Player.module.css"
import {
    ArrowDownOutlined,
    ArrowUpOutlined,
    EditOutlined,
    EyeOutlined,
    PlusOutlined
} from "@ant-design/icons";
import utils from "../../../../../../utils.module.css"
import {base64DecodeUtf8} from "../../../../../../service/utils/JsUtils";
import {replaceAll} from "@milkdown/utils"
import {Resource} from "../../EnhancerCard/EnhancerCardHooks";
import PlainLoading from "../../../../../utils/general/PlainLoading";
import {useDisplayTxt, useSegment} from "./ClozePlayerHooks";
import {updateImageToResource} from "../ResourcePlayerUtils";

const ClozePlayer = (props:{meta:Resource, readonly?: boolean}) => {
    const [data, setData ] = useState(" ")
    const [segments, setSegments] = useState<string[]>([])
    const [index, setIndex] = useState(-1)
    const [mode, setMode] = useState<"edit" | "view">("view")
    const [trigger, setTrigger] = useState<boolean>(false)
    const [loading, setLoading] = useState(true)
    const segment = useSegment()
    const displayTxt = useDisplayTxt()
    // eslint-disable-next-line
    useEffect(()=>{
        const effect = async ()=>{
            try {
                const resp = await getAllDataFromResource(props.meta.id!)
                setData(base64DecodeUtf8(resp["raw.md"]))
            }catch (err){
                await addDataToResource(props.meta.id!, "raw.md", " ")
                const resp = await getAllDataFromResource(props.meta.id!)
                setData(base64DecodeUtf8(resp["raw.md"]))
            }
            setTimeout(()=>setLoading(false), 100)
        }; effect().then()
    // eslint-disable-next-line
    },[])
    useEffect(()=>{
        setSegments(segment(data))
    // eslint-disable-next-line
    }, [data])
    useEffect(()=>{
        setTrigger((trigger)=>!trigger)
    }, [index, mode])


    if(loading) return <PlainLoading/>
    return (
        <div
            className={general.container}
            tabIndex={0}
            onKeyDown={async (k)=> {
                if(k.ctrlKey && k.key === "Enter"){
                    const newValue = `${data.endsWith("\n") ? data.substring(0,data.length-1): data} {{:: ::}}`
                    setData(newValue)
                    setTrigger(!trigger)
                    await addDataToResource(props.meta.id!, "raw.md",newValue)
                }}}>
            <Row>
                <Col span={1} className={classes.left_options}>{
                    mode === "view" &&
                    <>
                        <EditOutlined
                            className={utils.icon_button}
                            onClick={()=>setMode("edit")}/>
                        <ArrowUpOutlined
                            className={utils.icon_button}
                            onClick={()=>index >= 0 && setIndex(index - 1)}/>
                        <ArrowDownOutlined
                            className={utils.icon_button}
                            onClick={()=>setIndex(index === Math.floor(segments.length/2) - 1 ? -1 : index + 1)}/>
                    </>}{
                    !props.readonly && mode === "edit" &&
                    <>
                        <EyeOutlined
                            className={utils.icon_button}
                            onClick={()=>setMode("view")}/>
                        <Tooltip
                            title={"添加完型空（Ctrl + Enter）"}>
                            <PlusOutlined
                                className={utils.icon_button}
                                onClick={async ()=>{
                                    const newValue = `${data.endsWith("\n") ? data.substring(0,data.length-1): data} {{:: ::}}`
                                    setData(newValue)
                                    setTrigger(!trigger)
                                    await addDataToResource(props.meta.id!, "raw.md",newValue)
                                }}/>
                        </Tooltip>
                    </>
                }</Col>
                <Col span={22} offset={1}>
                    <div className={classes.display}>{
                        mode === "edit" ?
                            <div
                                className={classes.edit_wrapper}
                                onBlur={async ()=>{
                                    setData(data)
                                    await addDataToResource(props.meta.id!, "raw.md",data)
                                }}>
                                <></>
                                {data === " " && <span className={classes.placeholder}>在这里编辑卡片 . . . </span>}
                                <MilkdownProvider>
                                    <MilkdownEditor
                                        md={data}
                                        editable={true}
                                        onChange={cur=>{setData(cur)}}
                                        command={replaceAll(data, true)}
                                        trigger={trigger}
                                        updateImage={(image)=>updateImageToResource(image, props.meta.id!)}/>
                                </MilkdownProvider>
                            </div> :
                        mode === "view" ?
                            <div className={classes.view_wrapper}>
                                <MilkdownProvider>
                                    <MilkdownEditor
                                        md={displayTxt(segments, index)}
                                        editable={false}
                                        command={replaceAll(displayTxt(segments, index), true)}
                                        trigger={trigger}/>
                                </MilkdownProvider>
                            </div>: <></>
                    }</div>
                </Col>
            </Row>
            <Row>
                <Col span={4} offset={20} className={classes.options}>{

                }</Col>
            </Row>
        </div>
    );
};

export default ClozePlayer;