import React from 'react';
import CurrentKnodeInfo from "../utils/CurrentKnodeInfo";
import {Col, Row} from "antd";

const RecentKnodeConfigs = () => {
    return (
        <div>
            <CurrentKnodeInfo/>
            <Row>
                <Col span={20} offset={2}>

                </Col>
            </Row>
        </div>
    )
};

export default RecentKnodeConfigs;