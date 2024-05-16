import React, {useEffect, useState} from 'react';
import {
    addDataToResource, getDataFromResource,
} from "../../../../../../service/api/ResourceApi";
import classes from "./MindtraceHubResourcePlayer.module.css"
import {Col, Input, message, Row, Tooltip, Upload} from "antd";
import {FileTextOutlined, ShareAltOutlined, UploadOutlined} from "@ant-design/icons";
import utils from "../../../../../../utils.module.css"
import {Resource} from "../../EnhancerCard/EnhancerCardHooks";
import PlainLoading from "../../../../../utils/general/PlainLoading";
import {ENHANCER_HOST} from "../../../../../../service/api/EnhancerApi";
import TextArea from "antd/es/input/TextArea";

const MindtraceHubResourcePlayer = (props:{meta: Resource, readonly?: boolean}) => {
    const [data, setData] = useState<{data: boolean, remark: string, description: string}>({data: false, remark: "", description: ""})
    const [loading, setLoading] = useState(true)
    useEffect(()=>{
        const effect = async ()=>{
            try {
                const resp = await getDataFromResource(props.meta.id!, "data.json")
                !resp.description && (resp.description = "")
                setData(resp)
            }catch (err){
                await addDataToResource(props.meta.id!, "data.json", JSON.stringify(data))
                setData(await getDataFromResource(props.meta.id!, "data.json"))
            }
            setLoading(false)
        }; effect().then()
        //eslint-disable-next-line
    }, [])

    if(loading) return <PlainLoading/>
    return (
        <div
            className={classes.container}
            onBlur={()=>!props.readonly && addDataToResource(props.meta.id!, "data.json", JSON.stringify(data))}>
            <Row>
                <Col span={1} offset={1} className={classes.option}>{
                        data.data &&
                        <a target={"_blank"} rel={"noreferrer"} href={`${ENHANCER_HOST}/resource/${props.meta.id}/data/data/file?fileName=${data.remark}`}>
                            <Tooltip title={"点击跳转"}>
                                <ShareAltOutlined className={utils.icon_button}/>
                            </Tooltip>
                        </a>}{
                        !data.data &&
                        <Upload
                            name={"file"}
                            action={`${ENHANCER_HOST}/resource/${props.meta.id}/data/data/file`}
                            withCredentials={true}
                            onChange={async (resp)=>{
                                if (resp.file.status === 'done'){
                                    const tempInfo  = {...data, data: true, remark: resp.file.name}
                                    setData(tempInfo)
                                    await addDataToResource(props.meta.id!, "data.json", JSON.stringify(tempInfo))
                                } else if (resp.file.status === 'error')
                                    message.error(`${resp.file.name} file upload failed.`)
                            }}>
                            <Tooltip
                                title={"点击上传（上传和下载都较慢，请耐心等待）"}>
                                <UploadOutlined className={utils.icon_button}/>
                            </Tooltip>
                        </Upload>
                }</Col>
                <Col span={16}>
                    <Input
                        value={data.remark}
                        onChange={({target: {value}})=>setData({...data, remark: value})}
                        onBlur={()=>addDataToResource(props.meta.id!, "data.json", JSON.stringify(data))}
                        disabled={props.readonly}
                        bordered={false}
                        className={classes.title}
                        placeholder={"资源名称 . . ."}/>
                </Col>
            </Row>
            <Row>
                <Col span={1} offset={1}>
                    <FileTextOutlined className={utils.icon_button}/>
                </Col>
                <Col span={22}>{
                    <TextArea
                        rows={2}
                        value={data.description}
                        onChange={({target: {value}})=>setData({...data, description: value})}
                        onBlur={()=>addDataToResource(props.meta.id!, "data.json", JSON.stringify(data))}
                        disabled={props.readonly}
                        bordered={false}
                        className={classes.description}
                        placeholder={"资源描述 . . ."}/>
                }</Col>
            </Row>
        </div>
    );
};

export default MindtraceHubResourcePlayer;