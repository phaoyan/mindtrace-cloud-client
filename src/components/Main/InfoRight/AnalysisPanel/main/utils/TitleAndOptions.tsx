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
import classes from "./TitleAndOptions.module.css"
import {FinishedOutlined} from "../../../../../utils/antd/icons/Icons";
import {useFinish} from "./GeneralHooks";

const TitleAndOptions = () => {

    const [currentSession, setCurrentSession] = useRecoilState(CurrentExamSessionAtom)
    const chainStyleTitle = useRecoilValue(ExamCurrentKnodeChainStyleTitleSelector)
    const finish = useFinish()

    if(!currentSession) return <></>
    return (
        <Row>
            <Col span={23}>
                <Breadcrumb items={breadcrumbTitle(chainStyleTitle!, true)}/>
            </Col>
            <Col span={1}>
                <div className={classes.option_wrapper}>
                    <Popconfirm
                        title="确定要放弃本次测试？"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={async ()=>{
                            if(!currentSession) return
                            await interruptExamSession(currentSession.id)
                            setCurrentSession(undefined)
                        }}>
                        <DeleteOutlined className={utils.icon_button}/>
                    </Popconfirm>
                    <Popconfirm
                        title={"确定要提前提交本次测试？"}
                        okText="Yes"
                        cancelText="No"
                        onConfirm={finish}>
                        <FinishedOutlined className={utils.icon_button}/>
                    </Popconfirm>
                </div>
            </Col>
        </Row>
    );
};

export default TitleAndOptions;