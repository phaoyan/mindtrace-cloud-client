import React, {useState} from 'react';
import {Resource} from "../../EnhancerCard/EnhancerCardHooks";
import ReactAudioPlayer from "react-audio-player";
import classes from "./AudioPlayer.module.css"
import utils from "../../../../../../utils.module.css"
import {PlusOutlined} from "@ant-design/icons";
import {Upload} from "antd";
import {ENHANCER_HOST} from "../../../../../../service/api/EnhancerApi";
import {useRecoilValue} from "recoil";
import {MessageApiAtom} from "../../../../../../recoil/utils/DocumentData";

const AudioPlayer = (props:{meta: Resource, readonly?: boolean}) => {
    const [audioPlayerKey, setAudioPlayerKey] = useState(0)
    const messageApi = useRecoilValue(MessageApiAtom)
    return (
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
                        messageApi.success("音频上传成功！")
                    }}}>{
                <PlusOutlined className={utils.icon_button}/>
            }</Upload>
            <ReactAudioPlayer key={audioPlayerKey} src={`${ENHANCER_HOST}/resource/${props.meta.id}/data/audio`} controls/>
        </div>
    );
};

export default AudioPlayer;