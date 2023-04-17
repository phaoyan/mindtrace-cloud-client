import React, {useEffect, useState} from 'react';
import {ResizableBox} from "react-resizable";
import classes from "./InfoRight.module.css";
import { useRecoilValue} from "recoil";
import {KnodeSelector, SelectedKnodeIdAtom} from "../../../recoil/home/Knode";
import MdPreview from "../../utils/markdown/MdPreview";
import {Breadcrumb, Tabs} from "antd";
import {UserID} from "../../../recoil/User";
import {getChainStyleTitle} from "../../../service/api/KnodeApi";
import {BreadcrumbItemType} from "antd/es/breadcrumb/Breadcrumb";
import {BarChartOutlined, EditOutlined} from "@ant-design/icons";
import EnhancerPanel from "./enhancer/EnhancerPanel";
import utils from "../../../utils.module.css"
import RecordPanel from "./record/RecordPanel";

const InfoRight = () => {

    const userId = useRecoilValue(UserID)
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const selectedKnode = useRecoilValue(KnodeSelector(selectedKnodeId))
    const [chainStyleTitle, setChainStyleTitle] = useState("")

    useEffect(()=>{
        selectedKnodeId && selectedKnodeId !== 0 &&
        getChainStyleTitle(userId, selectedKnodeId)
            .then((data)=> {
                setChainStyleTitle(data)
            })
        // eslint-disable-next-line
    }, [selectedKnodeId])


    const breadcrumbTitle = ():BreadcrumbItemType[] =>{
        return chainStyleTitle.split(".")
            .filter(title=>title !== selectedKnode?.title && title !== "ROOT")
            .map(title=>({title: <MdPreview>{title}</MdPreview>})).reverse()
    }

    return (
        <ResizableBox
            className={classes.resize_box}
            width={window.innerWidth / 2} height={window.innerHeight}
            handle={<div className={classes.resize_handle}/>}
            minConstraints={[window.innerWidth / 4, window.innerHeight]}
            maxConstraints={[window.innerWidth * 3 / 4, window.innerHeight]}
            resizeHandles={["w"]}
            axis={"x"}>
            {selectedKnodeId ?
                <div className={`${classes.container} ${utils.custom_scrollbar}`} >
                    <div className={classes.title}>
                        <Breadcrumb items={breadcrumbTitle()}/>
                        <MdPreview>
                            {" > "+selectedKnode?.title}
                        </MdPreview>
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
                                    <BarChartOutlined/>
                                    <span>记录</span>
                                </div>),
                                key: "traces",
                                children: <RecordPanel/>
                            }
                        ]}/>
                </div>:<></>

            }
        </ResizableBox>
    );
};

export default InfoRight;