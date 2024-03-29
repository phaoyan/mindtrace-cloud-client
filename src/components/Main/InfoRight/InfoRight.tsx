import React, {useEffect, useState} from 'react';
import {ResizableBox} from "react-resizable";
import classes from "./InfoRight.module.css";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    CurrentChainStyleTitleAtom,
    KnodeSelector, SelectedKnodeIdAtom,
} from "../../../recoil/home/Knode";
import MdPreview from "../../utils/markdown/MdPreview";
import {Breadcrumb, Col, Row, Tabs, Tooltip} from "antd";
import {getChainStyleTitle, getLeaveCount} from "../../../service/api/KnodeApi";
import {
    BarChartOutlined, BookOutlined,
    ClockCircleOutlined, DownloadOutlined,
    EditOutlined,
    ShareAltOutlined
} from "@ant-design/icons";
import EnhancerPanel from "./EnhancerPanel/EnhancerPanel";
import utils from "../../../utils.module.css"
import RecordPanel from "./RecordPanel/RecordPanel";
import AnalysisPanel from "./AnalysisPanel/AnalysisPanel";
import SharePanel from "./SharePanel/SharePanel";
import {MainPageHeightAtom, MainPageWidthAtom} from "../../../recoil/utils/DocumentData";
import {breadcrumbTitle} from "../../../service/data/Knode";
import {CurrentTabAtom} from "./InfoRightHooks";
import {getEnhancerCount} from "../../../service/api/EnhancerApi";
import LocalPanel from "./LocalPanel/LocalPanel";
import {finishMonitor, isKnodeMonitored, startMonitor} from "../../../service/api/MasteryApi";

const InfoRight = () => {

    const mainPageHeight = useRecoilValue(MainPageHeightAtom)
    const mainPageWidth = useRecoilValue(MainPageWidthAtom)
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const selectedKnode = useRecoilValue(KnodeSelector(selectedKnodeId))
    const [chainStyleTitle, setChainStyleTitle] = useRecoilState(CurrentChainStyleTitleAtom)
    const [leaveCount, setLeaveCount] = useState<number>()
    const [enhancerCount, setEnhancerCount] = useState<number | undefined>(undefined)
    const [currentTab, setCurrentTab] = useRecoilState(CurrentTabAtom)
    const [isMonitored, setIsMonitored] = useState(false)


    useEffect(()=>{
        const effect = async ()=>{
            if(!selectedKnodeId || selectedKnodeId === 0) return
            setChainStyleTitle(await getChainStyleTitle(selectedKnodeId))
            setLeaveCount(await getLeaveCount(selectedKnodeId))
            setEnhancerCount(await getEnhancerCount(selectedKnodeId))
            setIsMonitored(await isKnodeMonitored(selectedKnodeId))
        }; effect()
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
                            <Col span={5} className={classes.left_info}>
                                <Tooltip title={"知识点数目"}>
                                    <div>{leaveCount}</div>
                                </Tooltip>
                                <div>/</div>
                                <Tooltip title={"笔记数目"}>
                                    <div>{enhancerCount}</div>
                                </Tooltip>
                            </Col>
                            <Col span={1} className={classes.review_mode_icon}>{
                                !isMonitored &&
                                <Tooltip title={"开启复习模式"}>
                                    <BookOutlined
                                        className={utils.icon_button}
                                        onClick={async ()=>{setIsMonitored(true); await startMonitor(selectedKnodeId)}}/>
                                </Tooltip>}{
                                isMonitored &&
                                <Tooltip title={"关闭复习模式"}>
                                    <EditOutlined
                                        className={utils.icon_button}
                                        onClick={async ()=>{setIsMonitored(false); await finishMonitor(selectedKnodeId)}}/>
                                </Tooltip>
                            }</Col>
                            <Col span={18}  className={classes.title}>
                                <MdPreview>
                                    {" > "+selectedKnode?.title}
                                </MdPreview>
                            </Col>
                        </Row>
                    </div>
                    <Tabs
                        activeKey={currentTab}
                        onChange={(tab: any)=>setCurrentTab(tab)}
                        tabPosition={"top"}
                        destroyInactiveTabPane={true}
                        items={[
                            {
                                label: (<div>
                                    <EditOutlined/>
                                    <span>笔记</span>
                                </div>),
                                key:"note",
                                children: <EnhancerPanel/>
                            },{
                                label: (<div>
                                    {/* eslint-disable-next-line react/jsx-no-undef */}
                                    <ClockCircleOutlined />
                                    <span>记录</span>
                                </div>),
                                key: "record",
                                children: <RecordPanel/>
                            },{
                                label: (<div>
                                    <BarChartOutlined/>
                                    <span>分析</span>
                                </div>),
                                key: "analysis",
                                children: <AnalysisPanel/>
                            },{
                                label: (<div>
                                    <ShareAltOutlined />
                                    <span>共享</span>
                                </div>),
                                key: "share",
                                children: <SharePanel/>
                            },{
                                label: (<div>
                                    <DownloadOutlined/>,
                                    <span>本地</span>
                                </div>),
                                key: "local",
                                children: <LocalPanel/>
                            }
                        ]}/>
                </div>:<></>

            }
        </ResizableBox>
    );
};

export default InfoRight;