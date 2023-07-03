import React, {useEffect, useState} from 'react';
import {addDataToResource, getAllDataFromResource} from "../../../../../service/api/ResourceApi";
import classes from "./ClozePlayer.module.css";
import {MilkdownProvider} from "@milkdown/react";
import {MilkdownEditor} from "../../../../utils/markdown/MilkdownEditor";
import {Col, Row, Tooltip} from "antd";
import general from "./Player.module.css"
import {
    DoubleLeftOutlined,
    DoubleRightOutlined,
    EditOutlined,
    EyeOutlined,
    PlusOutlined
} from "@ant-design/icons";
import utils from "../../../../../utils.module.css"
import {insertStringAt} from "../../../../../service/utils/JsUtils";
import {replaceAll} from "@milkdown/utils"
import {Resource} from "../EnhancerCard/EnhancerCardHooks";
import PlainLoading from "../../../../utils/general/PlainLoading";

const ClozePlayer = (props:{meta:Resource, readonly?: boolean}) => {

    interface DataType{
        raw: string,
        noAnswer:string,
        indexes: Array<{start: number, end:number, insert:number, txt: string}>
    }

    const [data, setData ] = useState<DataType>({raw:"", noAnswer:"", indexes:[]})
    const [loading, setLoading] = useState(true)
    const loadData = ()=>{
        getAllDataFromResource(props.meta.id!)
            .then((data)=>{
                setData({
                    raw: data.raw,
                    noAnswer: data.noAnswer,
                    indexes: data.indexes
                })
                setLoading(false)
            })
    }
    // eslint-disable-next-line
    useEffect(()=> loadData(),[])

    // 实际显示的markdown text，和index有关
    const [displayTxt, setDisplayTxt] = useState("")
    // 用于告知milkdown更新渲染
    const [displayChangeTrigger, setDisplayChangeTrigger] = useState(true)
    useEffect(()=>{
        setDisplayChangeTrigger(!displayChangeTrigger)
    // eslint-disable-next-line
    }, [displayTxt])
    const [mode, setMode] = useState<"view" | "edit" | undefined>()
    // index: 当前选中显示答案的空的索引。-1为不显示
    const [index, setIndex] = useState(-1)
    const [raw, setRaw] = useState("")
    useEffect(()=>{
        if(props.readonly)
            setMode("view")
        //eslint-disable-next-line
    }, [mode])
    useEffect(()=>{
        setRaw(data.raw)
    }, [data])
    useEffect(()=>{
        setTimeout(()=>{
            setMode("view")
        }, 500)
    }, [loading])
    const indexAnswer = ()=>{
        let offset = 0
        let res = data.noAnswer
        for(let i = 0; i < data.indexes.length; i ++){
            if(i !== index){
                res = insertStringAt(res, " -- ? -- ", data.indexes[i].insert + offset)
                offset += 9
            }else {
                res = insertStringAt(res, data.indexes[i].txt, data.indexes[i].insert + offset)
                offset += data.indexes[i].txt.length
            }
        }
        return res
    }
    useEffect(()=>{
        setDisplayTxt(indexAnswer())
        //eslint-disable-next-line
    }, [index, data.noAnswer, loading])
    const handleSubmit = async ()=>{
        !props.readonly &&
        await addDataToResource(props.meta.id!, {raw : raw})
            .then(()=>{
                // 由于后端数据持久化有非阻塞的部分，有时候url还没有替换完成就被重新加载。故设置一个延时
                setTimeout(()=>{
                    loadData()
                },100)
            })
    }
    const [rawChangeTrigger, setRawChangeTrigger] = useState(false)
    const addCloze = ()=>{
        setRaw(raw + "{{CLOZE::  }}")
        setTimeout(()=>setRawChangeTrigger(!rawChangeTrigger), 50)
    }

    const hotkey = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.ctrlKey && event.key === "Enter")
            addCloze()
    }

    if(loading) return <PlainLoading/>
    return (
        <div
            className={general.container}
            tabIndex={0}
            onKeyDown={hotkey}>
            <Row>
                <Col span={1} className={classes.left_options}>{
                    !props.readonly && (
                        mode === "edit" ?
                        <EyeOutlined
                            className={utils.icon_button}
                            onClick={()=>setMode("view")}/> :
                        mode === "view" ?
                        <EditOutlined
                            className={utils.icon_button}
                            onClick={()=>setMode("edit")}/>: <></>
                    )
                }{
                    mode === "edit" &&
                    <Tooltip
                        title={"添加完型空（Ctrl + Enter）"}>
                        <PlusOutlined
                            className={utils.icon_button}
                            onClick={addCloze}/>
                    </Tooltip>
                }</Col>

                <Col span={22} offset={1}>
                    <div className={classes.display}>{
                        mode === "edit" ?
                            <div
                                className={classes.edit_wrapper}
                                onBlur={handleSubmit}>
                                <></>
                                {raw === "" && <span className={classes.placeholder}>在这里编辑卡片 . . . </span>}
                                <MilkdownProvider>
                                    <MilkdownEditor
                                        md={raw}
                                        editable={true}
                                        onChange={cur=>{setRaw(cur)}}
                                        command={replaceAll(raw, true)}
                                        trigger={rawChangeTrigger}/>
                                </MilkdownProvider>
                            </div> :
                        mode === "view" ?
                            <div className={classes.view_wrapper}>
                                <MilkdownProvider>
                                    <MilkdownEditor
                                        md={displayTxt}
                                        editable={false}
                                        onChange={()=>{}}
                                        command={replaceAll(displayTxt, true)}
                                        trigger={displayChangeTrigger}/>
                                </MilkdownProvider>
                            </div>: <></>
                    }</div>
                </Col>
            </Row>
            <Row>
                <Col span={4} offset={20} className={classes.options}>{
                    mode === "view" &&
                    <>
                        <DoubleLeftOutlined
                            className={utils.icon_button}
                            onClick={()=>index >= 0 && setIndex(index - 1)}/>
                        <DoubleRightOutlined
                            className={utils.icon_button}
                            onClick={()=>setIndex(index === data.indexes.length - 1 ? -1 : index + 1)}/>
                    </>
                }</Col>
            </Row>
        </div>
    );
};

export default ClozePlayer;