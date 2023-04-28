import React, {useEffect, useRef, useState} from 'react';
import {Resource} from "../../../../../service/data/Resource";
import {getAllDataFromResource} from "../../../../../service/api/ResourceApi";
import classes from "./ClozePlayer.module.css";
import {MilkdownProvider} from "@milkdown/react";
import {MilkdownEditor} from "../../../../utils/markdown/MilkdownEditor";
import {Col, Row, Tooltip} from "antd";
import general from "./Player.module.css"
import {
    CheckOutlined,
    DoubleLeftOutlined,
    DoubleRightOutlined,
    EditOutlined,
    EyeOutlined,
    PlusOutlined
} from "@ant-design/icons";
import utils from "../../../../../utils.module.css"
import {insertStringAt} from "../../../../../service/utils/JsUtils";
import {submit} from "./PlayerUtils";
import {replaceAll} from "@milkdown/utils"

const ClozePlayer = (props:{meta:Resource}) => {

    interface DataType{
        raw: string,
        noAnswer:string,
        indexes: Array<{start: number, end:number, insert:number, txt: string}>
    }

    const [data, setData ] = useState<DataType>({raw:"", noAnswer:"", indexes:[]})
    const [loading, setLoading] = useState(true)
    const loadData = ()=>{
        getAllDataFromResource(props.meta.createBy!, props.meta.id!)
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
    }, [displayTxt])
    const [mode, setMode] = useState<"view" | "edit">("view")
    // index: 当前选中显示答案的空的索引。-1为不显示
    const [index, setIndex] = useState(-1)
    const [raw, setRaw] = useState("")
    useEffect(()=>{
        setRaw(data.raw)
    }, [data])
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
    }, [index, data.noAnswer])
    const handleSubmit = ()=>{
        submit(props.meta.createBy!, props.meta.id!, {raw : raw})
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

    if(loading) return <></>
    return (
        <div
            className={general.container}
            tabIndex={0}
            onKeyDown={hotkey}>
            <Row>
                <Col span={1} className={classes.left_options}>
                    {
                        mode === "edit" ?
                            <EyeOutlined
                                className={utils.icon_button}
                                onClick={()=>setMode("view")}/> :
                        mode === "view" ?
                                <EditOutlined
                                    className={utils.icon_button}
                                    onClick={()=>setMode("edit")}/>: <></>
                    }
                    {
                        mode === "edit" &&
                        <Tooltip
                            title={"添加完型空（Ctrl + Enter）"}>
                            <PlusOutlined
                                className={utils.icon_button}
                                onClick={addCloze}/>
                        </Tooltip>
                    }
                </Col>

                <Col span={22} offset={1}>
                    <div className={classes.display}>
                        {
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
                        }
                    </div>
                </Col>
            </Row>
            <Row>
                <Col span={4} offset={20} className={classes.options}>
                    {
                        mode === "view" &&
                            <>
                                <DoubleLeftOutlined
                                    className={utils.icon_button}
                                    onClick={()=>index >= 0 && setIndex(index - 1)}/>
                                <DoubleRightOutlined
                                    className={utils.icon_button}
                                    onClick={()=>index < data.indexes.length - 1 && setIndex(index + 1)}/>
                            </>
                    }
                </Col>
            </Row>
        </div>
    );
};

export default ClozePlayer;