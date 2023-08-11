import React, {useEffect, useState} from 'react';
import {MilkdownProvider} from "@milkdown/react";
import {MilkdownEditor} from "../../../../../utils/markdown/MilkdownEditor";
import {Col, Row} from "antd";
import {SwitcherFilled, SwitcherOutlined} from "@ant-design/icons";
import utils from "../../../../../../utils.module.css"
import classes from "../Player.module.css"
import milkdown from "../../../../../utils/markdown/MarkdownBasic.module.css"
import {addDataToResource, getAllDataFromResource} from "../../../../../../service/api/ResourceApi";
import {LatexDarkOutlined, LatexLightOutlined} from "../../../../../utils/antd/icons/Icons";
import {Resource} from "../../EnhancerCard/EnhancerCardHooks";
import PlainLoading from "../../../../../utils/general/PlainLoading";
import {base64DecodeUtf8} from "../../../../../../service/utils/JsUtils";

const QuizcardPlayer = (props: { meta: Resource, readonly? : boolean}) => {
    const [data, setData] = useState({
        front: "",
        back: "",
        config:{
            frontLatexDisplayMode: true,
            backLatexDisplayMode: true
        }})
    const [isFront, setIsFront] = useState(true)
    const [loading, setLoading] = useState(true)
    const [frontEditorKey, setFrontEditorKey] = useState(0)
    const [backEditorKey, setBackEditorKey] = useState(0)
    const [displayKey, setDisplayKey] = useState(0)
    useEffect(()=>{
        setFrontEditorKey(frontEditorKey+1)
        //eslint-disable-next-line
    },[data.config.frontLatexDisplayMode])
    useEffect(()=>{
        setBackEditorKey(backEditorKey+1)
        //eslint-disable-next-line
    },[data.config.backLatexDisplayMode])
    useEffect(()=>{
        setDisplayKey(displayKey+1)
        //eslint-disable-next-line
    }, [isFront])
    useEffect(()=>{
        const init = async ()=>{
            let resp = await getAllDataFromResource(props.meta.id!)
            try {
                setData(JSON.parse(base64DecodeUtf8(resp["data.json"])))
            }catch (err){
                await addDataToResource(props.meta.id!, "data.json", JSON.stringify(data))
                resp = await getAllDataFromResource(props.meta.id!)
                setData(JSON.parse((base64DecodeUtf8(resp["data.json"]))))
            }
            setLoading(false)
        }; init()
        //eslint-disable-next-line
    },[])

    if (loading) return <PlainLoading/>
    return (
        <div
            className={classes.container}
            tabIndex={0}
            onBlur={async ()=>await addDataToResource(props.meta.id!, "data.json", JSON.stringify(data))}>
            <Row>
                <Col span={1} className={classes.sidebar}>{
                    isFront ?
                    <div className={classes.front_options}>
                        <SwitcherOutlined
                            className={`${utils.icon_button}`}
                            onClick={() => setIsFront(false)}/>{
                            data.config.frontLatexDisplayMode ?
                            <LatexDarkOutlined
                                className={utils.icon_button}
                                onClick={async ()=>{
                                    const newValue = {...data, config: {...data.config, frontLatexDisplayMode: false}}
                                    setData(newValue)
                                    await addDataToResource(props.meta.id!, "data.json", JSON.stringify(data))
                                }}/>:
                            <LatexLightOutlined
                                className={utils.icon_button}
                                onClick={async ()=>{
                                    const newValue = {...data, config: {...data.config, frontLatexDisplayMode: true}}
                                    setData(newValue)
                                    await addDataToResource(props.meta.id!, "data.json", JSON.stringify(data))
                                }}/>
                    }</div> :
                    <div className={classes.back_options}>
                        <SwitcherFilled
                            className={`${utils.icon_button}`}
                            onClick={() => {setIsFront(true)}}/>{
                            data.config.backLatexDisplayMode ?
                            <LatexDarkOutlined
                                className={utils.icon_button}
                                onClick={async ()=>{
                                    const newValue = {...data, config: {...data.config, backLatexDisplayMode: false}}
                                    setData(newValue)
                                    await addDataToResource(props.meta.id!, "data.json", JSON.stringify(data))
                                }}/>:
                            <LatexLightOutlined
                                className={utils.icon_button}
                                onClick={async ()=>{
                                    const newValue = {...data, config: {...data.config, backLatexDisplayMode: true}}
                                    setData(newValue)
                                    await addDataToResource(props.meta.id!, "data.json", JSON.stringify(data))
                                }}/>
                    }</div>
                }</Col>
                <Col span={22} offset={1} key={displayKey}>{
                    isFront ?
                    <div className={classes.front_wrapper}>
                        {/*似乎缺少这个react不能检测到变化从而响应渲染*/}
                        <span></span>
                        {data.front === "" && <span className={classes.placeholder}>卡片正面 . . . </span>}
                        <div className={milkdown.markdown} key={frontEditorKey}>
                            <MilkdownProvider>
                                <MilkdownEditor
                                    md={data.front}
                                    editable={!props.readonly}
                                    latexDisplayMode={data.config.frontLatexDisplayMode}
                                    onChange={cur => setData({...data, front: cur})}/>
                            </MilkdownProvider>
                        </div>
                    </div>:
                    <div className={classes.back_wrapper}>
                        {data.back === "" && <span className={classes.placeholder}>卡片背面 . . . </span>}
                        <div className={milkdown.markdown} key={backEditorKey}>
                            <MilkdownProvider>
                                <MilkdownEditor
                                    md={data.back}
                                    editable={!props.readonly}
                                    latexDisplayMode={data.config.backLatexDisplayMode}
                                    onChange={cur=>setData({...data, back: cur})}/>
                            </MilkdownProvider>
                        </div>
                    </div>
                }</Col>
            </Row>
        </div>
    );
};

export default QuizcardPlayer;