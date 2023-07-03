import React, {useEffect, useState} from 'react';
import { Col, Dropdown, MenuProps, Row} from "antd";
import {getCurrentExamSession} from "../../../../service/api/MasteryApi";
import {useRecoilState, useRecoilValue} from "recoil";
import {SwapOutlined} from "@ant-design/icons";
import classes from "./AnalysisPanel.module.css"
import utils from "../../../../utils.module.css"
import ExamAnalysisPanel from "./analysis/ExamAnalysisPanel";
import ExamSessionPanel from "./ExamSessionPanel";
import {CurrentExamSessionAtom} from "../../../../recoil/home/ExamSession";
import {LoginUserIdSelector} from "../../../Login/LoginHooks";


const AnalysisPanel = () => {

    const userId = useRecoilValue(LoginUserIdSelector)
    const [selectedPanel, setSelectedPanel] = useState<string>("analysis")
    const [currentSession, setCurrentSession] = useRecoilState(CurrentExamSessionAtom)
    const [selectedPanelTitle, setSelectedPanelTitle] = useState<string>("分析报告")
    useEffect(()=>{
        const effect = async ()=>{
            const sessions = await getCurrentExamSession();
            setCurrentSession(sessions[0])
        }; effect()
        //eslint-disable-next-line
    }, [userId])
    useEffect(()=>{
        console.log("AnalysisPanel.currentSession", currentSession)
        setSelectedPanel(currentSession ? "session" : "analysis")
    }, [currentSession])
    useEffect(()=>{
        console.log("AnalysisPanel.selectedPanel", selectedPanel)
        if(selectedPanel === "session")
            setSelectedPanelTitle("知识测试")
        if(selectedPanel === "analysis")
            setSelectedPanelTitle("分析报告")
    }, [selectedPanel])

    const subPanelItems: MenuProps['items'] = [
        {
            key: "analysis",
            label: <span>分析报告</span>,
            onClick: ()=> setSelectedPanel("analysis")
        },
        {
            key: "session",
            label: <span>知识测试</span>,
            onClick: ()=> setSelectedPanel("session")
        }
    ]


    return (
        <div>
            <Row>
                <Col span={22}>
                    <span className={classes.selected_panel_title}>{selectedPanelTitle}</span>
                </Col>
                <Col span={2}>
                    <Dropdown
                        arrow={false}
                        menu={{items:subPanelItems}}>
                        <SwapOutlined className={utils.icon_button}/>
                    </Dropdown>
                </Col>
            </Row>
            {selectedPanel === "analysis" && <ExamAnalysisPanel/>}
            {selectedPanel === "session" && <ExamSessionPanel/>}
        </div>
    );
};

export default AnalysisPanel;