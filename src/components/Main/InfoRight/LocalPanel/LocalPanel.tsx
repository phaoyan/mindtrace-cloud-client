import React from 'react';
import {Col, Divider, Row, Tooltip, Upload} from "antd";
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
                <Col span={24}>
                    <div className={classes.download_wrapper}>
                        <Tooltip title={"点击下载当前知识数据(解析过程可能会花费若干分钟，请耐心等待)"}>
                            <a
                                href={`${LOCAL_HOST}/knode/${selectedKnodeId}/content`}
                                download={"data.md"}
                                target={"_blank"}
                                rel={"noreferrer"}>
                                <DownloadOutlined className={utils.icon_button_large}/>
                            </a>
                        </Tooltip>
                    </div>
                    <div className={classes.tips}>
                        * 可访问通义千问等大模型（<a href="https://tongyi.aliyun.com/qianwen/" target={"_blank"} rel="noreferrer">通义千问</a>），将markdown文件导入后获得专属指导AI
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default LocalPanel;