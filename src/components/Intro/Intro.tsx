import React from 'react';
import {Col, Row} from "antd";
import classes from "./Intro.module.css"
import utils from "../../utils.module.css"
import logo from "../../static/img/logo_no_txt.png";
import ktree from "../../static/img/intro/ktree.png"
import note1 from "../../static/img/intro/note1.png"
import note2 from "../../static/img/intro/note2.png"
import note4 from "../../static/img/intro/note4.png"
import note5 from "../../static/img/intro/note5.png"
import note6 from "../../static/img/intro/note6.png"
import note7 from "../../static/img/intro/note7.png"
import note8 from "../../static/img/intro/note8.png"
import note9 from "../../static/img/intro/note9.png"
import note10 from "../../static/img/intro/note10.png"
import traces from "../../static/img/intro/traces.png"
import trace2 from "../../static/img/intro/trace2.png"
import trace4 from "../../static/img/intro/trace4.png"
import {MilkdownProvider} from "@milkdown/react";
import {MilkdownEditor} from "../utils/markdown/MilkdownEditor";

const Intro = () => {

    return (
        <div className={`${classes.container}`}>
            <Row>
                <Col span={24}>
                    <div className={classes.logo_container}>
                        <img src={logo} alt={""} className={classes.logo}/>
                        <span className={classes.logo_txt}>Mind Trace</span>
                    </div>
                </Col>
            </Row>
            <Row className={classes.title}>
                <Col span={16} offset={8}>
                    <span className={classes.title_span}>
                        在线学习笔记 & 学习轨迹记录平台
                    </span>
                </Col>
            </Row>
            <br/>
            <Row>
                <Col span={8}>
                    <div className={classes.sub_title}>
                        <MilkdownProvider>
                            <MilkdownEditor md={"## 体系化知识记录"} editable={false}/>
                        </MilkdownProvider>
                    </div>
                    <br/>
                    <div>
                        <img src={ktree} alt={""} className={classes.sub_img}/>
                    </div>
                </Col>
                <Col span={8}>
                    <div>
                        <div className={classes.sub_title}>
                            <MilkdownProvider>
                                <MilkdownEditor md={"## 多样化笔记形式"} editable={false}/>
                            </MilkdownProvider>
                        </div>
                        <br/>
                        <div className={`${classes.col} ${utils.custom_scrollbar}`}>
                            <img src={note2} alt={""} className={classes.sub_img}/>
                            <img src={note1} alt={""} className={classes.sub_img}/>
                            <img src={note10} alt={""} className={classes.sub_img}/>
                            <img src={note7} alt={""} className={classes.sub_img}/>
                            <img src={note6} alt={""} className={classes.sub_img}/>
                            <img src={note4} alt={""} className={classes.sub_img}/>
                            <img src={note5} alt={""} className={classes.sub_img}/>
                            <img src={note8} alt={""} className={classes.sub_img}/>
                            <img src={note9} alt={""} className={classes.sub_img}/>
                        </div>
                    </div>
                </Col>
                <Col span={8}>
                    <div className={classes.sub_title}>
                        <MilkdownProvider>
                            <MilkdownEditor md={"## 详尽记录学习历程"} editable={false}/>
                        </MilkdownProvider>
                    </div>
                    <br/>
                    <div className={`${classes.col} ${utils.custom_scrollbar}`}>
                        <img src={traces} alt={""} className={classes.sub_img}/>
                        <img src={trace2} alt={""} className={classes.sub_img}/>
                        <img src={trace4} alt={""} className={classes.sub_img}/>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default Intro;