import React, {useEffect, useState} from 'react';
import {addDataToResource, getAllDataFromResource} from "../../../../../service/api/ResourceApi";
import classes from "./MindtraceHubResourePlayer.module.css"
import {Col, Dropdown, Input, message, Row, Tooltip, Upload} from "antd";
import {ShareAltOutlined, UploadOutlined} from "@ant-design/icons";
import utils from "../../../../../utils.module.css"
import {existsInHub, HUB_HOST} from "../../../../../service/api/HubApi";
import {mindtraceHubResourceTemplate, Resource} from "../EnhancerCard/EnhancerCardHooks";

export interface BasicInfo{
    id: number,
    url: string,
    title: string,
    contentType: string,
    size: number
}
export const contentTypeItems = [
    {
        key: "text/plain",
        label: <span className={utils.menu_item}>text/plain</span>
    },
    {
        key: "application/pdf",
        label: <span className={utils.menu_item}>application/pdf</span>
    }
]
const MindtraceHubResourcePlayer = (props:{meta: Resource, readonly?: boolean}) => {

    const [data, setData] = useState<BasicInfo>(mindtraceHubResourceTemplate(props.meta.createBy).data)
    const [loading, setLoading] = useState(false)
    useEffect(()=>{
        const init = async ()=>{
            const resp = await getAllDataFromResource(props.meta.id!);
            const dataJson = JSON.parse(resp["data.json"]);
            setData(dataJson)
            setLoading(false)
        }; init()
        //eslint-disable-next-line
    },[])

    const [resourceExists, setResourceExists] = useState(false)
    useEffect(()=>{
        if(data.id !== 0)
            existsInHub(data.id).then(exists=>setResourceExists(exists))
        //eslint-disable-next-line
    },[data.url])

    const handleSubmit = async (newValue?: BasicInfo)=>{
        !props.readonly && await addDataToResource(props.meta.id!, newValue ? newValue : data)
    }
    if(loading) return <></>
    return (
        <div className={classes.container}>
            <Row>
                <Col span={1} offset={1} className={classes.option}>
                    {
                        resourceExists &&
                        <a target={"_blank"} rel={"noreferrer"} href={data.url}>
                            <Tooltip
                                title={"点击跳转"}>
                                <ShareAltOutlined className={utils.icon_button}/>
                            </Tooltip>
                        </a>
                    }
                    {
                        !resourceExists && data.title && data.contentType &&
                        <Upload
                            name={"file"}
                            action={`${HUB_HOST}/user/${props.meta.createBy}?title=${data.title}&contentType=${data.contentType}`}
                            withCredentials={true}
                            showUploadList={false}
                            onChange={(info)=>{
                                if (info.file.status !== 'uploading')
                                    console.log(info.file, info.fileList)
                                if (info.file.status === 'done'){
                                    const newValue = {
                                        ...data,
                                        url: `${HUB_HOST}/resource/${info.file.response.id}`,
                                        id: info.file.response.id
                                    };
                                    setData(newValue)
                                    handleSubmit(newValue)
                                }
                                else if (info.file.status === 'error')
                                    message.error(`${info.file.name} file upload failed.`)
                            }}>
                            <Tooltip
                                title={"点击上传（不推荐上传过大的文件，加载可能会很慢）"}>
                                <UploadOutlined className={utils.icon_button}/>
                            </Tooltip>
                        </Upload>
                    }
                </Col>
                <Col span={16}>
                    <Input
                        value={data.title}
                        onChange={({target: {value}})=>{setData({...data, title: value})}}
                        onBlur={()=>handleSubmit()}
                        bordered={false}
                        className={classes.title}
                        placeholder={"资源标题 . . ."}/>
                </Col>
                <Col span={4}>
                    <Dropdown
                        menu={{
                            items:contentTypeItems,
                            onClick: ({key})=>{
                                setData({...data, contentType: key})
                                handleSubmit()
                            }
                        }}>
                        <span className={utils.menu_item} style={{cursor:"default"}}>{data.contentType}</span>
                    </Dropdown>
                </Col>
            </Row>
            <Row>
                <Col>

                </Col>
            </Row>
        </div>
    );
};

export default MindtraceHubResourcePlayer;