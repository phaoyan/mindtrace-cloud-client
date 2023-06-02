import React, {useEffect, useState} from 'react';
import {ResizableBox} from "react-resizable";
import classes from "./InfoRight.module.css";
import { useRecoilValue} from "recoil";
import {KnodeSelector, SelectedKnodeIdAtom} from "../../../recoil/home/Knode";
import MdPreview from "../../utils/markdown/MdPreview";
import {Breadcrumb, Col, Row, Tabs} from "antd";
import {getChainStyleTitle} from "../../../service/api/KnodeApi";
import {
    BarChartOutlined,
    ClockCircleOutlined,
    EditOutlined,
    ShareAltOutlined
} from "@ant-design/icons";
import EnhancerPanel from "./enhancer/EnhancerPanel";
import utils from "../../../utils.module.css"
import RecordPanel from "./record/RecordPanel";
import AnalysisPanel from "./analyze/AnalysisPanel";
import SharePanel from "./share/SharePanel";
import {MainPageHeightAtom, MainPageWidthAtom} from "../../../recoil/utils/DocumentData";
import {breadcrumbTitle} from "../../../service/data/Knode";

const InfoRight = () => {

    const mainPageHeight = useRecoilValue(MainPageHeightAtom)
    const mainPageWidth = useRecoilValue(MainPageWidthAtom)
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const selectedKnode = useRecoilValue(KnodeSelector(selectedKnodeId))
    const [chainStyleTitle, setChainStyleTitle] = useState<string[]>([])


    // title相关
    useEffect(()=>{
        selectedKnodeId && selectedKnodeId !== 0 &&
        getChainStyleTitle(selectedKnodeId)
            .then((data)=> {
                setChainStyleTitle(data)
            })
        // eslint-disable-next-line
    }, [selectedKnodeId])



    return (
        <ResizableBox
            className={classes.resize_box}
            width={mainPageWidth / 2} height={mainPageHeight * 0.98}
            handle={<div className={classes.resize_handle}/>}
            minConstraints={[mainPageWidth / 4, mainPageHeight * 0.98]}
            maxConstraints={[mainPageWidth * 31 / 32, mainPageHeight * 0.98]}
            resizeHandles={["w"]}
            axis={"x"}>
            {selectedKnodeId ?
                <div className={`${classes.container} ${utils.custom_scrollbar}`} >
                    <div className={classes.title}>
                        <Breadcrumb items={breadcrumbTitle(chainStyleTitle)}/>
                        <Row>
                            <Col span={24}  className={classes.title}>
                                <MdPreview>
                                    {" > "+selectedKnode?.title}
                                </MdPreview>
                            </Col>
                        </Row>
                    </div>
                    <Tabs
                        defaultActiveKey={"notes"}
                        tabPosition={"top"}
                        items={[
                            {
                                label: (<div>
                                    <EditOutlined/>
                                    <span>笔记</span>
                                </div>),
                                key:"notes",
                                children: <EnhancerPanel/>
                            },{
                                label: (<div>
                                    {/* eslint-disable-next-line react/jsx-no-undef */}
                                    <ClockCircleOutlined />
                                    <span>记录</span>
                                </div>),
                                key: "traces",
                                children: <RecordPanel/>
                            },{
                                label: (<div>
                                    <BarChartOutlined/>
                                    <span>分析</span>
                                </div>),
                                key: "statistics",
                                children: <AnalysisPanel/>
                            },{
                                label: (<div>
                                    <ShareAltOutlined />
                                    <span>共享</span>
                                </div>),
                                key: "share",
                                children: <SharePanel/>
                            }
                        ]}/>
                </div>:<></>

            }
        </ResizableBox>
    );
};

export default InfoRight;