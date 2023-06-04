import React from 'react';
import classes from "./BilibiliLinkoutPlayer.module.css"
import {Col, List, Row} from "antd";
import utils from "../../../../../../../utils.module.css"

const BilibiliLinkoutPlayer = (props:{data: any}) => {
    return (
        <div className={classes.container}>
            <Row>
                <Col>
                    <a
                        className={classes.title_link}
                        href={props.data.url}
                        target={"_blank"}
                        rel={"noreferrer"}>
                        {props.data.videoData?.title}
                    </a>
                </Col>
            </Row>
            <Row>
                <Col span={22} offset={2}>
                    <div className={`${classes.page_list_wrapper} ${utils.custom_scrollbar}`}>{
                        props.data.pages &&
                        props.data.pages.length > 1 &&
                        <List
                            itemLayout={"horizontal"}
                            dataSource={props.data.pages ? props.data.pages : []}
                            renderItem={(item: any, index)=>(
                                <List.Item>
                                    <div className={classes.page_line}>
                                        <span className={classes.page_index}>{item.page}</span>
                                        <a className={classes.title_link}
                                           href={`${props.data.url}?p=${item.page}`}
                                           target={"_blank"}
                                            rel={"noreferrer"}>{item.part}</a>
                                    </div>
                                </List.Item>
                            )}/>
                    }</div>
                </Col>
            </Row>
        </div>
    );
};

export default BilibiliLinkoutPlayer;