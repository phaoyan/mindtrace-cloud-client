import React from 'react';
import {Col, Row, Tooltip, Upload} from "antd";
import {DownloadOutlined, UploadOutlined} from "@ant-design/icons";
import utils from "../../../../utils.module.css"
import classes from "./LocalPanel.module.css"
import {LOCAL_HOST} from "../../../../service/api/LocalApi";
import {useRecoilValue} from "recoil";
import {SelectedKnodeIdAtom} from "../../../../recoil/home/Knode";

const LocalPanel = () => {
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    return (
        <div>
            <Row>
                <Col span={10} offset={2}>
                    <div className={classes.download_wrapper}>
                        <Tooltip title={"点击下载当前知识数据"}>
                            <a
                                href={`${LOCAL_HOST}/knode/${selectedKnodeId}/all`}
                                download={"data.zip"}
                                target={"_blank"}
                                rel={"noreferrer"}>
                                <DownloadOutlined className={utils.icon_button_large}/>
                            </a>
                        </Tooltip>
                    </div>
                </Col>
                <Col span={10}>
                    <div className={classes.download_wrapper}>
                        <Tooltip title={"点击上传知识数据(data.zip)"}>
                            <Upload
                                name={"file"}
                                action={`${LOCAL_HOST}/knode/${selectedKnodeId}/all`}
                                withCredentials={true}
                                showUploadList={false}
                                onChange={async (info)=>info.file.status === 'done' && window.location.reload()}>
                                <UploadOutlined className={utils.icon_button_large}/>
                            </Upload>
                        </Tooltip>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default LocalPanel;