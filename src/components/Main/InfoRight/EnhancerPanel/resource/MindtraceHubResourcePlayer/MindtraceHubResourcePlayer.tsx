import React, {useEffect, useState} from 'react';
import {
    addDataToResource, getDataFromResource,
} from "../../../../../../service/api/ResourceApi";
import classes from "./MindtraceHubResourcePlayer.module.css"
import {Col, Input, message, Row, Tooltip, Upload} from "antd";
import {ShareAltOutlined, UploadOutlined} from "@ant-design/icons";
import utils from "../../../../../../utils.module.css"
import {Resource} from "../../EnhancerCard/EnhancerCardHooks";
import PlainLoading from "../../../../../utils/general/PlainLoading";
import {ENHANCER_HOST} from "../../../../../../service/api/EnhancerApi";

const MindtraceHubResourcePlayer = (props:{meta: Resource, readonly?: boolean}) => {
    const [info, setInfo] = useState<{data?: boolean, title?: string, remark?: string}>({})
    const [loading, setLoading] = useState(true)
    useEffect(()=>{
        const effect = async ()=>{
            try {
                setInfo(await getDataFromResource(props.meta.id!, "data.json"))
            }catch (err){
                await addDataToResource(props.meta.id!, "data.json", JSON.stringify(info))
                setInfo(await getDataFromResource(props.meta.id!, "data.json"))
            }
            setLoading(false)
        }; effect().then()
        //eslint-disable-next-line
    }, [])
    if(loading) return <PlainLoading/>
    return (
        <div className={classes.container}>
            <Row>
                <Col span={1} offset={1} className={classes.option}>{
                        info.data &&
                        <a target={"_blank"} rel={"noreferrer"} href={`${ENHANCER_HOST}/resource/${props.meta.id}/data/data/file?fileName=${info.title}`}>
                            <Tooltip
                                title={"点击跳转"}>
                                <ShareAltOutlined className={utils.icon_button}/>
                            </Tooltip>
                        </a>}{
                        !info.data &&
                        <Upload
                            name={"file"}
                            action={`${ENHANCER_HOST}/resource/${props.meta.id}/data/data/file`}
                            withCredentials={true}
                            onChange={async (resp)=>{
                                if (resp.file.status === 'done'){
                                    const tempInfo  = {...info, data: true, remark: resp.file.name}
                                    setInfo(tempInfo)
                                    await addDataToResource(props.meta.id!, "data.json", JSON.stringify({tempInfo, data: true}))
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
                        value={info.remark}
                        onChange={({target: {value}})=>setInfo({...info, remark: value})}
                        onBlur={()=>addDataToResource(props.meta.id!, "data.json", JSON.stringify(info))}
                        disabled={props.readonly}
                        bordered={false}
                        className={classes.title}
                        placeholder={"资源描述 . . ."}/>
                </Col>
            </Row>
        </div>
    );
};

export default MindtraceHubResourcePlayer;