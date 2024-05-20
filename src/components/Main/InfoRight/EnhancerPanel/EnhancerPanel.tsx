import React, {useEffect, useState} from 'react';
import {useRecoilState, useRecoilValue} from "recoil";
import {SelectedKnodeIdAtom} from "../../../../recoil/home/Knode";
import {Enhancer} from "../../../../service/data/Enhancer";
import {
    copyEnhancer, getEnhancerGroupsByKnodeId,
    getEnhancersForKnode,
    getEnhancersForOffsprings,
    scissorEnhancer
} from "../../../../service/api/EnhancerApi";
import {Col, Divider, Dropdown, Pagination, Row, Switch, Tooltip} from "antd";
import {BlockOutlined, CopyOutlined, PlusOutlined, ScissorOutlined} from "@ant-design/icons";
import classes from "./EnhancerPanel.module.css";
import utils from "../../../../utils.module.css"
import {EnhancerCardIdClipboardAtom, EnhancersForSelectedKnodeAtom} from "../../../../recoil/home/Enhancer";
import {EnhancerPanelKeyAtom} from "../../../../recoil/utils/DocumentData";
import {EnhancerCard} from "./EnhancerCard/EnhancerCard";
import {ReadonlyModeAtom} from "../../Main/MainHooks";
import ReviewPanel from "./ReviewPanel/ReviewPanel";
import {
    ResourceType,
    useAddEnhancer,
    useAddEnhancerGroup,
    useAddResourceDropdownItems
} from "./EnhancerCard/EnhancerCardHooks";
import {CopiedMilestoneIdAtom} from "../RecordPanel/HistoryStudyRecord/MilestonePanel/MilestonePanelHooks";
import {copyMilestoneAsEnhancerToKnode} from "../../../../service/api/TracingApi";
import dayjs from "dayjs";
import {EnhancerPanelCurrentPageAtom} from "./EnhancerPanelHooks";
import {
    EnhancerGroup,
    EnhancerGroupsForSelectedKnodeAtom,
    SelectedKnodeEnhancerIdsInGroupSelector
} from "./EnhancerGroupCard/EnhancerGroupCardHooks";
import EnhancerGroupCard from "./EnhancerGroupCard/EnhancerGroupCard";
const EnhancerPanel = () => {

    const readonly = useRecoilValue(ReadonlyModeAtom)
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [enhancers, setEnhancers] = useRecoilState<Enhancer[]>(EnhancersForSelectedKnodeAtom)
    const [enhancerGroups, setEnhancerGroups] = useRecoilState<EnhancerGroup[]>(EnhancerGroupsForSelectedKnodeAtom)
    const enhancerIdsInGroups = useRecoilValue(SelectedKnodeEnhancerIdsInGroupSelector);
    const [enhancerPanelKey, setEnhancerPanelKey] = useRecoilState(EnhancerPanelKeyAtom)
    const [enhancerIdClipboard, setEnhancerIdClipboard] = useRecoilState(EnhancerCardIdClipboardAtom)
    const [copiedMilestoneId, setCopiedMilestoneId] = useRecoilState(CopiedMilestoneIdAtom)
    const [offspringMode, setOffspringMode] = useState<boolean>(false)
    const [offspringEnhancers, setOffspringEnhancers] = useState<Enhancer[]>([])
    const [currentPage, setCurrentPage] = useRecoilState(EnhancerPanelCurrentPageAtom)
    const addResourceDropdownItems = useAddResourceDropdownItems()
    const addEnhancer = useAddEnhancer()
    const addEnhancerGroup = useAddEnhancerGroup();
    const pageSize = 16

    // selectedKnodeId -> enhancers
    useEffect(() => {
        const effect = async ()=>{
            if(!selectedKnodeId) return
            setEnhancers((await getEnhancersForKnode(selectedKnodeId)))
            setEnhancerGroups(await getEnhancerGroupsByKnodeId(selectedKnodeId))
        }; effect().then()
        // eslint-disable-next-line
    }, [selectedKnodeId, enhancerPanelKey])
    useEffect(()=>{
        const effect = async ()=>{
            if(offspringMode)
                setOffspringEnhancers((await getEnhancersForOffsprings(selectedKnodeId)).sort((a,b)=>dayjs(b.createTime).diff(a.createTime)))
        }; effect().then()
    }, [offspringMode, selectedKnodeId])
    useEffect(()=>{

    }, [])

    return (
        <div className={classes.container} key={enhancerPanelKey}>
            <ReviewPanel/>

            <div className={classes.add_card_wrapper}>
                <Row>
                    <Col span={18}>{
                        !readonly &&
                        <>
                            <Dropdown
                                menu={{
                                    items: [
                                        ...addResourceDropdownItems,
                                        {
                                            key: ResourceType.ENHANCER_GROUP,
                                            label: "笔记合集",
                                            icon: <BlockOutlined className={classes.option}/>,
                                            onClick: addEnhancerGroup
                                        }
                                    ],
                                    onClick: addEnhancer}}>
                                <PlusOutlined className={utils.icon_button}/>
                            </Dropdown>{
                            enhancerIdClipboard &&
                            <>
                                <Tooltip title={"剪切（删除原有笔记）"}>
                                    <ScissorOutlined
                                        className={utils.icon_button}
                                        style={{marginLeft:"2em"}}
                                        onClick={ async ()=>{
                                            await scissorEnhancer(enhancerIdClipboard[0],enhancerIdClipboard[1],selectedKnodeId)
                                            setEnhancerPanelKey(enhancerPanelKey+1)
                                            setEnhancerIdClipboard(undefined)
                                        }}/>
                                </Tooltip>
                                <Tooltip title={"粘贴笔记（不删除原有笔记）"}>
                                    <CopyOutlined
                                        className={utils.icon_button}
                                        style={{marginLeft:"2em"}}
                                        onClick={ async ()=>{
                                            await copyEnhancer(enhancerIdClipboard[0],enhancerIdClipboard[1],selectedKnodeId)
                                            setEnhancerPanelKey(enhancerPanelKey+1)
                                            setEnhancerIdClipboard(undefined)
                                        }}/>
                                </Tooltip>
                            </>}{
                            copiedMilestoneId &&
                            <Tooltip title={"粘贴笔记"}>
                                <CopyOutlined
                                    className={utils.icon_button}
                                    style={{marginLeft:"2em"}}
                                    onClick={ async ()=>{
                                        await copyMilestoneAsEnhancerToKnode(copiedMilestoneId,selectedKnodeId)
                                        setEnhancerPanelKey(enhancerPanelKey+1)
                                        setCopiedMilestoneId(undefined)
                                    }}/>
                            </Tooltip>
                        }<span className={classes.placeholder}>在这里添加笔记 . . . </span>
                        </>
                    }</Col>
                    <Col span={5}>
                        <span className={classes.placeholder}>{
                            offspringMode ?
                                "包括子知识笔记":
                                "仅有自身笔记"
                        }</span>
                    </Col>
                    <Col span={1}>
                        <Switch checked={offspringMode} onChange={(checked)=>setOffspringMode(checked)}/>
                    </Col>
                </Row>
            </div>

            <div className={classes.groups}>{
                enhancerGroups
                    .filter(group=>!!group)
                    .map(group=>(
                    <div key={group.id}>
                        <EnhancerGroupCard id={group.id} readonly={readonly}/>
                        <Divider/>
                    </div>
                ))
            }</div>
            <div className={classes.main}>{
                (offspringMode ? offspringEnhancers : enhancers.filter(enhancer=>!enhancerIdsInGroups.includes(enhancer.id)))
                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    .map(enhancer=>(
                        <div key={enhancer.id}>
                            <EnhancerCard id={enhancer.id} readonly={offspringMode || readonly}/>
                            <Divider/>
                        </div>
                    ))
            }<Pagination
                pageSize={pageSize}
                onChange={(page)=>setCurrentPage(page)}
                current={currentPage}
                hideOnSinglePage={true}
                total={(offspringMode ? offspringEnhancers : enhancers.filter(enhancer=>!enhancerIdsInGroups.includes(enhancer.id))).length}/>
            </div>
        </div>
    );
};

export default EnhancerPanel;