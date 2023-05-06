import React, {useEffect, useState} from 'react';
import {Resource} from "../../../../../service/data/Resource";
import {useRecoilValue} from "recoil";
import {Col, Row} from "antd";
import utils from "../../../../../utils.module.css"
import general from "./Player.module.css"
import {FileTextFilled, FileTextOutlined} from "@ant-design/icons";
import {MilkdownProvider} from "@milkdown/react";
import {MilkdownEditor} from "../../../../utils/markdown/MilkdownEditor";
import {loadData, submit} from "./PlayerUtils";
import {KnodeSelector, SelectedKnodeIdAtom} from "../../../../../recoil/home/Knode";
import milkdown from "../../../../utils/markdown/MarkdownBasic.module.css"

const MarkdownPlayer = (props: {meta: Resource, readonly? : boolean}) => {

    const [data, setData ] = useState({content: "", config:{hide: false}})
    const [loading, setLoading] = useState(true)

    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const selectedKnode = useRecoilValue(KnodeSelector(selectedKnodeId))

    // eslint-disable-next-line
    useEffect(()=>loadData(props.meta.createBy!, props.meta.id!, setData, setLoading),[])

    const hotkey = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.shiftKey && event.key === "Enter")
            handleSubmit(props.meta.id!, data)
    }

    const handleSubmit = (resourceId: number, data: any)=>{
        !props.readonly &&
        submit(resourceId, data)
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
                                setData({...data, config: {...data.config, hide: false}})
                                setTimeout(()=>handleSubmit(props.meta.id!, data), 100)
                            }}/>:
                        <FileTextOutlined
                            className={utils.icon_button}
                            onClick={()=> {
                                setData({...data, config: {...data.config, hide: true}})
                                setTimeout(()=> {
                                    handleSubmit(props.meta.id!, data)
                                }, 100)
                            }}/>
                    }
                </Col>
                <Col span={22} offset={1}>
                    {data.config.hide ?
                        <>
                            <span className={general.placeholder}> {selectedKnode?.title} 知识概述 . . . </span>
                        </>:
                        <>
                            {data.content === "" && <span className={general.placeholder}>知识概述 . . . </span>}
                            <div className={milkdown.markdown}>
                                <MilkdownProvider>
                                    <MilkdownEditor
                                        md={data.content}
                                        editable={!props.readonly}
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