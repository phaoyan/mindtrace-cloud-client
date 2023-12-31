import React, {useEffect, useState} from 'react';
import {Resource} from "../../EnhancerCard/EnhancerCardHooks";
import ReactAudioPlayer from "react-audio-player";
import classes from "./AudioPlayer.module.css"
import utils from "../../../../../../utils.module.css"
import {PlusOutlined} from "@ant-design/icons";
import {Col, Input, Row, Upload} from "antd";
import {ENHANCER_HOST} from "../../../../../../service/api/EnhancerApi";
import {useRecoilValue} from "recoil";
import {MessageApiAtom} from "../../../../../../recoil/utils/DocumentData";
import {addDataToResource, getDataFromResource} from "../../../../../../service/api/ResourceApi";
import PlainLoading from "../../../../../utils/general/PlainLoading";

const AudioPlayer = (props:{meta: Resource, readonly?: boolean}) => {
    const [audioPlayerKey, setAudioPlayerKey] = useState(0)
    const messageApi = useRecoilValue(MessageApiAtom)
    const [info, setInfo] = useState<{remark: string}>({remark: ""})
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
        <div>
            <Row>
                <Col span={23} offset={1}>
                    <Input
                        className={classes.title}
                        placeholder={"音频名称 . . . "}
                        disabled={props.readonly}
                        value={info.remark}
                        onChange={({target: {value}})=>setInfo({remark: value})}
                        onBlur={()=>addDataToResource(props.meta.id!, "data.json", JSON.stringify(info))}
                        bordered={false}/>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <div className={classes.container}>
                        <Upload
                            name={"file"}
                            action={`${ENHANCER_HOST}/resource/${props.meta.id}/data/audio/file`}
                            withCredentials={true}
                            showUploadList={false}
                            className={classes.upload}
                            onChange={async (info)=>{
                                if(info.file.status === "done"){
                                    setAudioPlayerKey((key)=>key+1)
                                    const tempInfo = {remark: info.file.name}
                                    setInfo(tempInfo)
                                    await addDataToResource(props.meta.id!, "data.json", JSON.stringify(tempInfo))
                                    messageApi.success("音频上传成功！")
                                }}}>{
                            <PlusOutlined className={utils.icon_button}/>
                        }</Upload>
                        <ReactAudioPlayer
                            key={audioPlayerKey}
                            src={`${ENHANCER_HOST}/resource/${props.meta.id}/data/audio`}
                            controls/>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default AudioPlayer;