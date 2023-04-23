import React, {useEffect, useState} from 'react';
import {Resource} from "../../../../../service/data/Resource";
import {useRecoilValue} from "recoil";
import {UserID} from "../../../../../recoil/User";
import {MilkdownProvider} from "@milkdown/react";
import {MilkdownEditor} from "../../../../utils/markdown/MilkdownEditor";
import {Col, Row} from "antd";
import {SwitcherFilled, SwitcherOutlined} from "@ant-design/icons";
import utils from "../../../../../utils.module.css"
import classes from "./Player.module.css"
import {loadData, submit} from "./PlayerUtils";
import milkdown from "../../../../utils/markdown/MarkdownBasic.module.css"

const QuizcardPlayer = (props: { meta: Resource }) => {

    const userId = useRecoilValue(UserID)
    const [data, setData] = useState({front: "", back: "", imgs: {}})
    const [isFront, setIsFront] = useState(true)
    const [loading, setLoading] = useState(true)

    // eslint-disable-next-line
    useEffect(() => loadData(userId, props.meta.id!, setData, setLoading), [])
    const hotkey = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.shiftKey && event.key === "Enter")
            submit(userId, props.meta.id!, data)
    }

    if (loading) return <></>
    return (
        <div
            className={classes.container}
            tabIndex={0}
            onKeyDown={hotkey}
            onBlur={()=>submit(userId, props.meta.id!, data)}>
            <Row>
                <Col span={1} className={classes.sidebar}>
                    {isFront ?
                        <SwitcherOutlined
                            className={`${utils.icon_button}`}
                            onClick={() => setIsFront(false)}/> :
                        <SwitcherFilled
                            className={`${utils.icon_button}`}
                            onClick={() => setIsFront(true)}/>
                    }
                </Col>
                <Col span={22} offset={1}>
                    {isFront ?
                        <div className={classes.front_wrapper}>
                            {/*似乎缺少这个react不能检测到变化从而响应渲染*/}
                            <></>
                            {data.front === "" && <span className={classes.placeholder}>卡片正面 . . . </span>}
                            <div className={milkdown.markdown}>
                                <MilkdownProvider>
                                    <MilkdownEditor md={data.front} onChange={cur => setData({...data, front: cur})}/>
                                </MilkdownProvider>
                            </div>
                        </div>:
                        <div className={classes.back_wrapper}>
                            {data.back === "" && <span className={classes.placeholder}>卡片背面 . . . </span>}
                            <div className={milkdown.markdown}>
                                <MilkdownProvider>
                                    <MilkdownEditor md={data.back} onChange={cur=>setData({...data, back: cur})}/>
                                </MilkdownProvider>
                            </div>
                        </div>
                    }
                </Col>
            </Row>
        </div>
    );
};

export default QuizcardPlayer;