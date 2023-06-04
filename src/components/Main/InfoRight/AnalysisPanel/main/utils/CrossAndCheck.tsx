import React from 'react';
import {Col, Row} from "antd";
import {CheckOutlined, CloseOutlined} from "@ant-design/icons";
import utils from "../../../../../../utils.module.css";

const CrossAndCheck = (props:{check: ()=>Promise<void>, cross: ()=>Promise<void>}) => {
    return (
        <div>
            <Row>
                <Col span={2} offset={6}>
                    <CloseOutlined
                        className={utils.icon_button}
                        onClick={props.cross}/>
                </Col>
                <Col span={2} offset={8}>
                    <CheckOutlined
                        className={utils.icon_button}
                        onClick={props.check}/>
                </Col>
            </Row>
        </div>
    );
};

export default CrossAndCheck;