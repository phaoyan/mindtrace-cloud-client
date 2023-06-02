import React from 'react';
import {Col, Row} from "antd";
import classes from "./DefaultLinkoutPlayer.module.css"

const DefaultLinkoutPlayer = (props:{data:any}) => {
    return (
        <div>
            <Row>
                <Col>
                    <div className={classes.wrapper}>
                        <a
                            className={classes.title_link}
                            href={props.data.url}
                            target={"_blank"}>
                            {props.data.title}
                        </a>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default DefaultLinkoutPlayer;