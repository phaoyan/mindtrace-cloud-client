import React, {useEffect, useRef, useState} from 'react';
import classes from "./EnhancerCard.module.css";
import {Breadcrumb, Col, Dropdown, Input, Row, Tooltip} from "antd";
import {
    BlockOutlined,
    BookOutlined,
    DeleteOutlined, DownOutlined, FieldTimeOutlined, FormOutlined, LinkOutlined,
    MinusOutlined,
    PlusOutlined,
    ScissorOutlined, UpOutlined
} from "@ant-design/icons";
import utils from "../../../../../utils.module.css"
import {
    getEnhancerById,
    getKnodesByEnhancerId,
    setEnhancerIsQuiz,
    setEnhancerTitle
} from "../../../../../service/api/EnhancerApi";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {getResourcesFromEnhancer, removeResource} from "../../../../../service/api/ResourceApi";
import {EnhancerCardIdClipboardAtom} from "../../../../../recoil/home/Enhancer";
import {SelectedKnodeIdAtom} from "../../../../../recoil/home/Knode";
import {MessageApiAtom} from "../../../../../recoil/utils/DocumentData";
import {
    EnhancerAtomFamily,
    EnhancerResourcesAtomFamily,
    ResourcePlayer, useAddEnhancerToGroup,
    useAddResource,
    useAddResourceDropdownItems,
    useShiftEnhancer,
    useShiftResource
} from "./EnhancerCardHooks";
import {useHandleRemoveEnhancer} from "../EnhancerPanelHooks";
import dayjs from "dayjs";
import {Knode, useBreadcrumbTitleForJump} from "../../../../../service/data/Knode";
import {getAncestors} from "../../../../../service/api/KnodeApi";
import {getStudyTraceEnhancerInfo} from "../../../../../service/api/TracingApi";
import {formatMillisecondsToHHMM} from "../../../../../service/utils/TimeUtils";
import {
    SelectedKnodeAncestorEnhancerGroupsAtom,
    useInitSelectedKnodeAncestorEnhancerGroups
} from "../EnhancerGroupCard/EnhancerGroupCardHooks";

export const EnhancerCard = (props: {id: number, readonly? : boolean, hideName?: boolean}) => {

    const [selectedKnodeId,] = useRecoilState(SelectedKnodeIdAtom)
    const [enhancer, setEnhancer] = useRecoilState(EnhancerAtomFamily(props.id))
    const [enhancerGroups, ] = useRecoilState(SelectedKnodeAncestorEnhancerGroupsAtom)
    const [relatedKnodeTitleDataList, setRelatedKnodeTitleDataList] = useState<Knode[][]>([])
    const [resources, setResources] = useRecoilState(EnhancerResourcesAtomFamily(props.id))
    const setEnhancerIdClipboard = useSetRecoilState(EnhancerCardIdClipboardAtom)
    const messageApi = useRecoilValue(MessageApiAtom)
    const [traceInfo, setTraceInfo] = useState<any>()
    const addResourceDropdownItems = useAddResourceDropdownItems()
    const handleRemove = useHandleRemoveEnhancer()
    const addResource = useAddResource(props.id)
    const shiftEnhancer = useShiftEnhancer()
    const shiftResource = useShiftResource(props.id)
    const breadcrumbTitleForJump = useBreadcrumbTitleForJump()
    const addEnhancerToGroup = useAddEnhancerToGroup(props.id)
    const mainPart = useRef(null)
    const [mainPartHeight, setMainPartHeight] = useState(0)
    const [maxHeight, setMaxHeight] = useState<number | undefined>(200)

    useInitSelectedKnodeAncestorEnhancerGroups()
    useEffect(()=>{
        const init = async ()=>{
            setEnhancer(await getEnhancerById(props.id))
            setResources(await getResourcesFromEnhancer(props.id))
            setTraceInfo(await getStudyTraceEnhancerInfo(props.id))
            const knodeTitleDataList = []
            const knodes = await getKnodesByEnhancerId(props.id);
            for(let knode of knodes){
                knodeTitleDataList.push(await getAncestors(knode.id))
            }
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
                    <Col span={10}>{
                        !props.hideName &&
                        (props.readonly ?
                            <span
                                className={classes.title}
                                style={{padding:"0.5em"}}>
                                {enhancer.title}
                            </span> :
                            <Input
                                value={enhancer.title}
                                onChange={({target: {value}}) => enhancer && setEnhancer({...enhancer, title: value})}
                                onBlur={() => !props.readonly && setEnhancerTitle(props.id, enhancer.title)}
                                placeholder={". . ."}
                                className={classes.title}
                                bordered={false}/>)
                    }</Col>
                    <Col span={4} className={classes.tag_wrapper}>
                        <span className={classes.date}>{dayjs(enhancer.createTime).format("YYYY-MM-DD")}</span>
                    </Col>
                    <Col span={3} className={classes.tag_wrapper}>{
                        traceInfo &&
                        traceInfo.duration &&
                        <Tooltip title={"学习时长（时：分）"}>
                            <FieldTimeOutlined style={{position:"relative", left:"-1em"}}/>
                            <span className={classes.date}>{formatMillisecondsToHHMM(traceInfo.duration * 1000)}</span>
                        </Tooltip>
                    }</Col>
                    <Col span={1}>{
                        !props.readonly &&
                        <div className={classes.move_enhancer_box}>
                            <UpOutlined className={utils.icon_button_normal} onClick={()=>shiftEnhancer(selectedKnodeId, enhancer.id, 1)}/>
                            <DownOutlined className={utils.icon_button_normal} onClick={()=>shiftEnhancer(selectedKnodeId, enhancer.id, -1)}/>
                        </div>
                    }</Col>
                    <Col span={1} offset={1}>{
                        !props.readonly && !enhancer.isQuiz &&
                        <Tooltip title={"将笔记加入测试题库"}>
                            <BookOutlined
                                className={utils.icon_button}
                                onClick={()=>{
                                    setEnhancer({...enhancer, isQuiz: true})
                                    setEnhancerIsQuiz(props.id, true).then()
                                }}/>
                        </Tooltip>}{
                        !props.readonly && enhancer.isQuiz &&
                        <Tooltip title={"将笔记移出测试题库"}>
                            <FormOutlined
                                className={utils.icon_button}
                                onClick={()=>{
                                    setEnhancer({...enhancer, isQuiz: false})
                                    setEnhancerIsQuiz(props.id, false).then()
                                }}/>
                        </Tooltip>
                    }</Col>
                    <Col span={1} offset={1}>{
                        !props.readonly &&
                        <ScissorOutlined
                            className={utils.icon_button}
                            onClick={()=>{
                                setEnhancerIdClipboard([props.id, selectedKnodeId])
                                messageApi.success("笔记剪切成功").then()
                            }}/>
                    }</Col>
                    <Col span={1} offset={1}>{
                        !props.readonly &&
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
                        </Col>
                        <Col span={22}>
                            <ResourcePlayer resource={resource} readonly={props.readonly}/>
                        </Col>
                        <Col span={1}>{
                            props.readonly ? <></>:
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
                    !props.readonly &&
                    enhancerGroups &&
                    <Dropdown
                        menu={{items: enhancerGroups.map((group)=>({
                                key: group.id,
                                label: group.title
                            })), onClick: async (data)=>addEnhancerToGroup(data.key)}}
                        placement={"bottomLeft"}>
                        <Tooltip title={"加入合集"}>
                            <BlockOutlined className={utils.icon_button} style={{position: "relative", left:"1em"}}/>
                        </Tooltip>
                    </Dropdown>
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
                    !props.readonly &&
                    <DeleteOutlined
                        className={utils.icon_button}
                        onClick={()=>handleRemove(enhancer.id)}/>
                }</Col>
            </Row>

        </div>
    )
}

