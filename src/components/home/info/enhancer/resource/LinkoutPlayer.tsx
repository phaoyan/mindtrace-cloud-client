import React, {ReactElement, useEffect, useState} from 'react';
import {linkoutTemplate, Resource} from "../../../../../service/data/Resource";
import BilibiliLinkoutPlayer from "./linkout/BilibiliLinkoutPlayer";
import {Col, Divider, Dropdown, Input, MenuProps, Row} from "antd";
import utils from "../../../../../utils.module.css"
import classes from "./LinkoutPlayer.module.css"
import {RedoOutlined, SearchOutlined} from "@ant-design/icons";
import DefaultLinkoutPlayer from "./linkout/DefaultLinkoutPlayer";
import {addDataToResource, getAllDataFromResource} from "../../../../../service/api/ResourceApi";
import {BilibiliTVOutlined} from "../../../../utils/antd/icons/Icons";


// 在这里注册网站类型，然后实现相应组件即可
const supportedWebsites: {[type:string]: (data: any)=>ReactElement} = {
    "bilibili": (data)=><BilibiliLinkoutPlayer data={data}/>,
    "default": (data)=><DefaultLinkoutPlayer data={data}/>
}
const linkoutTypeItems: MenuProps['items'] = [
    {
        key: "bilibili",
        label: <span className={utils.menu_item}>bilibili</span>,
        icon: <BilibiliTVOutlined/>
    },
    {
        key: "default",
        label: <span className={utils.menu_item}>default</span>,
        icon: <SearchOutlined />
    }
]
const LinkoutPlayer = (props:{meta: Resource, readonly?: boolean}) => {

    const [data, setData ] = useState<{type: string, url:string}>(linkoutTemplate(props.meta.createBy).data)
    const [loading, setLoading] = useState(true)

    // 将修改后的type和url上传至后端并重新加载这个Linkout，
    // 如果输入正确则可以正常显示url资源
    const [submitState, setSubmitState] = useState(false)
    const reload = async ()=>{
        if(!props.readonly){
            await addDataToResource(props.meta.id!, data)
            // 由于后端数据持久化有非阻塞的部分，有时候url还没有替换完成就被重新加载。故设置一个延时
            setTimeout(()=>{
                setSubmitState(!submitState)
            },1000)
        }
    }

    useEffect(()=>{
        const init = async ()=>{
            setData(await getAllDataFromResource(props.meta.id!))
            setLoading(false)
        }; init()
        //eslint-disable-next-line
    },[submitState])

    if(loading) return <span className={classes.loading}> 资源加载中 . . .</span>
    return (
        <div className={classes.container}>
            <Row>
                <Col span={22} offset={2}>
                    {
                        supportedWebsites[data.type] ?
                            supportedWebsites[data.type](data) :
                            <div className={utils.no_data} style={{height:"5em"}}>
                                No Data
                            </div>
                    }
                </Col>
            </Row>
            <Row>
                <Col span={16} offset={2}>
                    <div className={classes.url_wrapper}>
                        <Input
                            bordered={false}
                            placeholder={"输入资源的网址 . . ."}
                            value={data.url}
                            onChange={({target: {value}})=>{setData({...data, url: value})}}/>
                        <RedoOutlined
                            className={`${utils.icon_button} ${utils.grey}`}
                            onClick={()=>reload()}/>
                    </div>
                    <Divider className={utils.ghost_horizontal_divider}/>
                </Col>
                <Col span={6}>
                    <Dropdown
                        menu={{
                            items:linkoutTypeItems,
                            onClick: ({key})=>{setData({...data, type: key})}
                        }}>
                        <span className={classes.type_select}>{data.type}</span>
                    </Dropdown>
                </Col>
            </Row>
        </div>
    )
};

export default LinkoutPlayer;