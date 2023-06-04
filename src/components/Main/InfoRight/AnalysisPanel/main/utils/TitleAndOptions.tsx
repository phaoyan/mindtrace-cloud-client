import React from 'react';
import {Breadcrumb, Col, Popconfirm, Row} from "antd";
import {breadcrumbTitle} from "../../../../../../service/data/Knode";
import {DeleteOutlined} from "@ant-design/icons";
import utils from "../../../../../../utils.module.css";
import {interruptExamSession} from "../../../../../../service/api/MasteryApi";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    CurrentExamSessionAtom,
    ExamCurrentKnodeChainStyleTitleSelector
} from "../../../../../../recoil/home/ExamSession";

const TitleAndOptions = () => {

    const [currentSession, setCurrentSession] = useRecoilState(CurrentExamSessionAtom)
    const chainStyleTitle = useRecoilValue(ExamCurrentKnodeChainStyleTitleSelector)

    if(!currentSession) return <></>
    return (
        <Row>
            <Col span={23}>
                <Breadcrumb items={breadcrumbTitle(chainStyleTitle!, true)}/>
            </Col>
            <Col span={1}>
                <Popconfirm
                    title="确定要放弃本次测试？"
                    onConfirm={async ()=>{
                        if(!currentSession) return
                        await interruptExamSession(currentSession.id)
                        setCurrentSession(undefined)
                    }}
                    okText="Yes"
                    cancelText="No">
                    <DeleteOutlined className={utils.icon_button}/>
                </Popconfirm>
            </Col>
        </Row>
    );
};

export default TitleAndOptions;