import React, {useEffect, useState} from 'react';
import {ResizableBox} from "react-resizable";
import classes from "./InfoRight.module.css";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    CurrentChainStyleTitleAtom,
    KnodeSelector, SelectedKnodeIdAtom,
} from "../../../recoil/home/Knode";
import MdPreview from "../../utils/markdown/MdPreview";
import {Breadcrumb, Col, Dropdown, Row, Tabs, Tooltip} from "antd";
import {getChainStyleTitle, getLeaveCount} from "../../../service/api/KnodeApi";
import {
    BarChartOutlined, BarsOutlined, BookOutlined,
    ClockCircleOutlined, DownloadOutlined,
    EditOutlined, SearchOutlined,
} from "@ant-design/icons";
import EnhancerPanel from "./EnhancerPanel/EnhancerPanel";
import utils from "../../../utils.module.css"
import RecordPanel from "./RecordPanel/RecordPanel";
import AnalysisPanel from "./AnalysisPanel/AnalysisPanel";
import {MainPageWidthAtom} from "../../../recoil/utils/DocumentData";
import {breadcrumbTitle} from "../../../service/data/Knode";
import {
    CurrentTabAtom,
    KnodeSelectionHistoryItemsSelector,
    useUpdateKnodeSelectionHistory
} from "./InfoRightHooks";
import {getEnhancerCount} from "../../../service/api/EnhancerApi";
import LocalPanel from "./LocalPanel/LocalPanel";
import {finishMonitor, isKnodeMonitored, startMonitor} from "../../../service/api/MasteryApi";
import {useJumpToKnode} from "../Main/MainHooks";
import SearchPanel from "./SearchPanel/SearchPanel";

const InfoRight = () => {

    const mainPageWidth = useRecoilValue(MainPageWidthAtom)
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const selectedKnode = useRecoilValue(KnodeSelector(selectedKnodeId))
    const knodeSelectionHistoryItems = useRecoilValue(KnodeSelectionHistoryItemsSelector);
    const [chainStyleTitle, setChainStyleTitle] = useRecoilState(CurrentChainStyleTitleAtom)
    const [leaveCount, setLeaveCount] = useState<number>()
    const [enhancerCount, setEnhancerCount] = useState<number | undefined>(undefined)
    const [currentTab, setCurrentTab] = useRecoilState(CurrentTabAtom)
    const [isMonitored, setIsMonitored] = useState(false)
    const jumpToKnode = useJumpToKnode();

    useUpdateKnodeSelectionHistory()
    useEffect(()=>{
        const effect = async ()=>{
            if(!selectedKnodeId || selectedKnodeId === 0) return
            setChainStyleTitle(await getChainStyleTitle(selectedKnodeId))
            setLeaveCount(await getLeaveCount(selectedKnodeId))
            setEnhancerCount(await getEnhancerCount(selectedKnodeId))
            setIsMonitored(await isKnodeMonitored(selectedKnodeId))
        }; effect().then()
        // eslint-disable-next-line
    }, [selectedKnodeId])

    // @ts-ignore
    return (
        <ResizableBox
            className={classes.resize_box}
            width={mainPageWidth / 2} height={document.body.scrollHeight * 0.95}
            handle={<div className={classes.resize_handle}/>}
            minConstraints={[mainPageWidth / 4, document.body.scrollWidth * 0.98]}
            maxConstraints={[mainPageWidth * 31 / 32, document.body.scrollWidth * 0.98]}
            resizeHandles={["w"]}
            axis={"x"}>
            {selectedKnodeId ?
                <div className={`${classes.container} ${utils.custom_scrollbar}`} >
                    <div className={classes.title}>
                        <Row>
                            <Col span={1}>

                                <Dropdown menu={{
                                    items:knodeSelectionHistoryItems,
                                    //@ts-ignore
                                    onClick: (data)=>jumpToKnode(data.key)}}>
                                    <BarsOutlined className={`${utils.icon_button} ${classes.selected_knode_history_button}`}/>
                                </Dropdown>
                            </Col>
                            <Col span={23}>
                                <Breadcrumb items={breadcrumbTitle(chainStyleTitle)}/>
                            </Col>
                        </Row>
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
                            },                            {
                                label: (<div>
                                    <SearchOutlined/>
                                    <span>搜索</span>
                                </div>),
                                key:"search",
                                children: <SearchPanel/>
                            },{
                                label: (<div>
                                    <BarChartOutlined/>
                                    <span>分析</span>
                                </div>),
                                key: "analysis",
                                children: <AnalysisPanel/>
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