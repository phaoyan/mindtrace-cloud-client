import React, {useEffect, useRef, useState} from 'react';
import classes from "./EnhancerCard.module.css";
import {Breadcrumb, Col, Dropdown, Input, Popconfirm, Row, Tooltip} from "antd";
import {
    BlockOutlined, CalendarOutlined, CopyFilled, CopyOutlined,
    DeleteOutlined, DisconnectOutlined, DownloadOutlined, DownOutlined, FieldTimeOutlined, LinkOutlined,
    MinusOutlined,
    PlusOutlined,
    ScissorOutlined, UpOutlined
} from "@ant-design/icons";
import utils from "../../../../../utils.module.css"
import {
    getEnhancerById, getEnhancerGroupsByEnhancerId,
    getKnodesByEnhancerId,
    setEnhancerTitle
} from "../../../../../service/api/EnhancerApi";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {getResourcesFromEnhancer, removeResource} from "../../../../../service/api/ResourceApi";
import {EnhancerCardIdClipboardAtom} from "../../../../../recoil/home/Enhancer";
import {SelectedKnodeIdAtom} from "../../../../../recoil/home/Knode";
import {
    CopiedResourceIdsAtom,
    EnhancerAtomFamily,
    EnhancerResourcesAtomFamily,
    ResourcePlayer, useAddEnhancerToGroup,
    useAddResource,
    useAddResourceDropdownItems, usePasteResources, useRelatedKnodeDropdownItems,
    useShiftEnhancer, useShiftEnhancerInGroup,
    useShiftResource
} from "./EnhancerCardHooks";
import {useHandleRemoveEnhancer} from "../EnhancerPanelHooks";
import dayjs from "dayjs";
import {Knode, useBreadcrumbTitleForJump} from "../../../../../service/data/Knode";
import {getAncestors} from "../../../../../service/api/KnodeApi";
import {getStudyTraceEnhancerInfo} from "../../../../../service/api/TracingApi";
import {formatMillisecondsToHHMM} from "../../../../../service/utils/TimeUtils";
import {
    EnhancerRelGroupIdsAtomFamily,
    SelectedKnodeAncestorEnhancerGroupsAtom,
    useInitSelectedKnodeAncestorEnhancerGroups, useRemoveEnhancerGroupRel
} from "../EnhancerGroupCard/EnhancerGroupCardHooks";
import {LoginUserIdSelector} from "../../../../Login/LoginHooks";
import {LOCAL_HOST} from "../../../../../service/api/LocalApi";

export const EnhancerCard = (props: {
    id: number,
    readonly? : boolean,
    hideName?: boolean,
    fromGroup?: number
}) => {
    const [readonly, setReadonly] = useState(props.readonly)
    const userId = useRecoilValue(LoginUserIdSelector)
    const [selectedKnodeId,] = useRecoilState(SelectedKnodeIdAtom)
    const [enhancer, setEnhancer] = useRecoilState(EnhancerAtomFamily(props.id))
    const [ancestorEnhancerGroups, ] = useRecoilState(SelectedKnodeAncestorEnhancerGroupsAtom)
    const [relatedGroups, setRelatedGroups] = useRecoilState(EnhancerRelGroupIdsAtomFamily(props.id))
    const [relatedKnodeTitleDataList, setRelatedKnodeTitleDataList] = useState<Knode[][]>([])
    const [resources, setResources] = useRecoilState(EnhancerResourcesAtomFamily(props.id))
    const [copiedResourceIds, setCopiedResourceIds] = useRecoilState(CopiedResourceIdsAtom)
    const setEnhancerIdClipboard = useSetRecoilState(EnhancerCardIdClipboardAtom)
    const [traceInfo, setTraceInfo] = useState<any>()
    const addResourceDropdownItems = useAddResourceDropdownItems()
    const relatedKnodeDropdownItems = useRelatedKnodeDropdownItems(props.id)
    const handleRemove = useHandleRemoveEnhancer()
    const addResource = useAddResource(props.id)
    const shiftEnhancer = useShiftEnhancer()
    const shiftEnhancerInGroup = useShiftEnhancerInGroup()
    const shiftResource = useShiftResource(props.id)
    const pasteResources = usePasteResources(props.id)
    const breadcrumbTitleForJump = useBreadcrumbTitleForJump()
    const addEnhancerToGroup = useAddEnhancerToGroup(props.id)
    const removeEnhancerGroupRel = useRemoveEnhancerGroupRel()
    const mainPart = useRef(null)
    const [mainPartHeight, setMainPartHeight] = useState(0)
    const [maxHeight, setMaxHeight] = useState<number | undefined>(200)

    useInitSelectedKnodeAncestorEnhancerGroups()
    useEffect(()=>{
        const init = async ()=>{
            const enhancerTemp = await getEnhancerById(props.id);
            enhancerTemp.createBy !== userId &&
            setReadonly(true)
            setEnhancer(enhancerTemp)
            setResources(await getResourcesFromEnhancer(props.id))
            setTraceInfo(await getStudyTraceEnhancerInfo(props.id))
            setRelatedGroups(await getEnhancerGroupsByEnhancerId(props.id))
            const knodeTitleDataList = []
            const knodes = await getKnodesByEnhancerId(props.id);
            for(let knode of knodes)
                knodeTitleDataList.push(await getAncestors(knode.id))
            setRelatedKnodeTitleDataList(knodeTitleDataList)
        };init().then()
        //eslint-disable-next-line
    }, [props.id])
    useEffect(() => {
        // 构建一个ResizeObserver实例，当观察的元素尺寸变化时执行回调
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries)
                // 在这里更新高度
                setMainPartHeight(entry.contentRect.height);
        });
        // 开始观察一个元素
        if (mainPart.current)
            resizeObserver.observe(mainPart.current);
        // 清理函数
        return () => resizeObserver.disconnect()
    }, [])

    return (
        <div className={classes.container}>
            <div className={classes.header_part}>
                <Row>
                    <Col span={9}>{
                        !props.hideName &&
                        (readonly ?
                            <span
                                className={classes.title}
                                style={{padding:"0.5em"}}>
                                {enhancer.title}
                            </span> :
                            <Input
                                value={enhancer.title}
                                onChange={({target: {value}}) => enhancer && setEnhancer({...enhancer, title: value})}
                                onBlur={() => !readonly && setEnhancerTitle(props.id, enhancer.title)}
                                placeholder={". . ."}
                                className={classes.title}
                                bordered={false}/>)
                    }</Col>
                    <Col span={4} className={classes.tag_wrapper}>
                        <CalendarOutlined style={{position:"relative", left:"-0.5em"}}/>
                        <span className={classes.date}>{dayjs(enhancer.createTime).format("YYYY-MM-DD")}</span>
                    </Col>
                    <Col span={3} className={classes.tag_wrapper}>{
                        traceInfo &&
                        traceInfo.duration &&
                        <Tooltip title={"学习时长（时：分）"}>
                            <FieldTimeOutlined style={{position:"relative", left:"-0.5em"}}/>
                            <span className={classes.date}>{formatMillisecondsToHHMM(traceInfo.duration * 1000)}</span>
                        </Tooltip>
                    }</Col>
                    <Col span={1}>{
                        copiedResourceIds.length !== 0 &&
                        <Tooltip title={"粘贴笔记资源"}>
                            <CopyFilled
                                className={utils.icon_button}
                                onClick={()=>pasteResources()}/>
                        </Tooltip>
                    }</Col>
                    <Col span={1}>{
                        !readonly &&
                        !props.fromGroup &&
                        <div className={classes.move_enhancer_box}>
                            <UpOutlined className={utils.icon_button_normal} onClick={()=>shiftEnhancer(selectedKnodeId, enhancer.id, -1)}/>
                            <DownOutlined className={utils.icon_button_normal} onClick={()=>shiftEnhancer(selectedKnodeId, enhancer.id, 1)}/>
                        </div>}{
                        !readonly &&
                        props.fromGroup &&
                        <div className={classes.move_enhancer_box}>
                            <UpOutlined
                                className={utils.icon_button_normal}
                                onClick={()=>shiftEnhancerInGroup(props.fromGroup!, enhancer.id, -1)}/>
                            <DownOutlined
                                className={utils.icon_button_normal}
                                onClick={()=>shiftEnhancerInGroup(props.fromGroup!, enhancer.id, 1)}/>
                        </div>
                    }</Col>
                    {/*<Col span={1} offset={1}>{*/}
                    {/*    !readonly && !enhancer.isQuiz &&*/}
                    {/*    <Tooltip title={"将笔记加入测试题库"}>*/}
                    {/*        <BookOutlined*/}
                    {/*            className={utils.icon_button}*/}
                    {/*            onClick={()=>{*/}
                    {/*                setEnhancer({...enhancer, isQuiz: true})*/}
                    {/*                setEnhancerIsQuiz(props.id, true).then()*/}
                    {/*            }}/>*/}
                    {/*    </Tooltip>}{*/}
                    {/*    !readonly && enhancer.isQuiz &&*/}
                    {/*    <Tooltip title={"将笔记移出测试题库"}>*/}
                    {/*        <FormOutlined*/}
                    {/*            className={utils.icon_button}*/}
                    {/*            onClick={()=>{*/}
                    {/*                setEnhancer({...enhancer, isQuiz: false})*/}
                    {/*                setEnhancerIsQuiz(props.id, false).then()*/}
                    {/*            }}/>*/}
                    {/*    </Tooltip>*/}
                    {/*}</Col>*/}
                    <Col span={1} offset={1}>
                        <a
                            href={`${LOCAL_HOST}/enhancer/${enhancer.id}/content`}
                            style={{color:"#111"}}
                            target={"_blank"}
                            rel={"noreferrer"}>
                            <DownloadOutlined className={utils.icon_button}/>
                        </a>
                    </Col>
                    <Col span={1} offset={1}>{
                        !readonly &&
                        <Dropdown menu={{items: relatedKnodeDropdownItems}}>
                            <ScissorOutlined
                                className={utils.icon_button}
                                onClick={()=>{
                                    setEnhancerIdClipboard([props.id, selectedKnodeId])
                                }}/>
                        </Dropdown>
                    }</Col>
                    <Col span={1} offset={1}>{
                        !readonly &&
                        <Dropdown
                            menu={{items: addResourceDropdownItems, onClick: (data: any)=>addResource(data.key)}}>
                            <PlusOutlined className={utils.icon_button}/>
                        </Dropdown>
                    }</Col>
                </Row>{
                relatedKnodeTitleDataList
                    .map((data)=>(
                    <Row key={data[data.length-1].id}>
                        <Col span={1}>
                            <LinkOutlined
                                className={utils.icon_button_normal}
                                style={{position:"relative", left: "0.5em"}}/>
                        </Col>
                        <Col span={22}>{
                            <Breadcrumb items={breadcrumbTitleForJump(data)}/>
                        }</Col>
                    </Row>
                ))
            }</div>

            <div className={classes.main_part} ref={mainPart} style={{maxHeight: maxHeight}}>{
                resources.map(resource => (
                    <Row key={resource.id}>
                        <Col span={1}>
                            <div className={classes.move_resource_box}>
                                <UpOutlined className={utils.icon_button_normal} onClick={()=>shiftResource(resource.id!, -1)}/>
                                <DownOutlined className={utils.icon_button_normal} onClick={()=>shiftResource(resource.id!, 1)}/>
                            </div>
                            <div className={classes.move_resource_box}>
                                <CopyOutlined
                                    className={utils.icon_button_normal}
                                    onClick={()=>setCopiedResourceIds(resourceIds=>[...new Set([...resourceIds, resource.id!])])}/>
                            </div>
                        </Col>
                        <Col span={22}>
                            <ResourcePlayer resource={resource} readonly={readonly}/>
                        </Col>
                        <Col span={1}>{
                            readonly ? <></>:
                            <MinusOutlined
                                className={`${classes.resource_delete} ${utils.icon_button}`}
                                onClick={async ()=>{
                                    await removeResource(resource.id!)
                                    setResources(resources.filter(temp=>temp.id !== resource.id))
                                }}/>
                        }</Col>
                    </Row>
                ))}
            </div>
            <Row style={{paddingTop:"0.5em"}}>
                <Col span={1}>{
                    !readonly &&
                    !props.fromGroup &&
                    ancestorEnhancerGroups &&
                    <Dropdown
                        menu={{
                                items: ancestorEnhancerGroups
                                    .filter(group=>!!group)
                                    .map((group)=>({
                                        key: group.id,
                                        label: group.title,
                                        disabled: relatedGroups.includes(group.id)
                            })), onClick: async (data)=>addEnhancerToGroup(data.key)}}
                        placement={"bottomLeft"}>
                        <Tooltip title={"加入合集"}>
                            <BlockOutlined className={utils.icon_button} style={{position: "relative", left:"1em"}}/>
                        </Tooltip>
                    </Dropdown>}{
                    !readonly &&
                    props.fromGroup &&
                    <Tooltip title={"从合集中移除"}>
                        <DisconnectOutlined
                            className={utils.icon_button}
                            style={{position: "relative", left:"1em"}}
                            onClick={()=>removeEnhancerGroupRel(props.id, props.fromGroup!)}
                        />
                    </Tooltip>
                }</Col>
                <Col span={22}>{
                    mainPartHeight >= 200 &&
                    (
                        maxHeight ?
                            <div
                                className={`${classes.extend_prompt} ${utils.icon_button_normal}`}
                                onClick={()=>setMaxHeight(undefined)}>
                                点击展开
                            </div> :
                            <div
                                className={`${classes.extend_prompt} ${utils.icon_button_normal}`}
                                onClick={()=>setMaxHeight(200)}>
                                点击收回
                            </div>
                    )
                }</Col>
                <Col span={1}>{
                    !readonly &&
                    <Popconfirm
                        title={"确定要删除该学习笔记？"}
                        showCancel={false}
                        onConfirm={()=>handleRemove(enhancer.id)}>
                        <DeleteOutlined className={utils.icon_button}/>
                    </Popconfirm>
                }</Col>
            </Row>
        </div>
    )
}


