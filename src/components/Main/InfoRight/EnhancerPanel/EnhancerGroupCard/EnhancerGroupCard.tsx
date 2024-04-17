import React, {useEffect, useState,} from 'react';
import {Col, Dropdown, Input, Pagination, Row, Tooltip} from "antd";
import {
    EnhancerGroupAtomFamily, EnhancerGroupResourcesAtomFamily,
    GroupRelatedEnhancerIdsAtomFamily, GroupTraceInfoAtomFamily,
    SelectedKnodeAncestorEnhancerGroupsAtom, useAddResourceToEnhancerGroup, useRemoveEnhancerGroup
} from "./EnhancerGroupCardHooks";
import {
    getEnhancerGroupById,
    getEnhancersByGroupId,
    getResourcesByGroupId,
    setEnhancerGroupTitle,
} from "../../../../../service/api/EnhancerApi";
import {useRecoilState} from "recoil";
import {EnhancerCard} from "../EnhancerCard/EnhancerCard";
import {ResourcePlayer, useAddResourceDropdownItems} from "../EnhancerCard/EnhancerCardHooks";
import {DeleteOutlined, FieldTimeOutlined, MinusOutlined, PlusOutlined} from "@ant-design/icons";
import classes from "./EnhancerGroupCard.module.css"
import utils from "../../../../../utils.module.css"
import {removeResourceFromEnhancerGroup} from "../../../../../service/api/ResourceApi";
import {getStudyTraceEnhancerGroupInfo} from "../../../../../service/api/TracingApi";
import {formatMillisecondsToHHMM} from "../../../../../service/utils/TimeUtils";

const EnhancerGroupCard = (props:{id: number, hideName?: boolean, readonly?: boolean}) => {

    const [group, setGroup] = useRecoilState(EnhancerGroupAtomFamily(props.id))
    const [enhancerIds, setEnhancerIds] = useRecoilState(GroupRelatedEnhancerIdsAtomFamily(props.id))
    const [traceInfo, setTraceInfo] = useRecoilState(GroupTraceInfoAtomFamily(props.id))
    const [resources, setResources] = useRecoilState(EnhancerGroupResourcesAtomFamily(props.id))
    const [, setAncestorEnhancerGroups] = useRecoilState(SelectedKnodeAncestorEnhancerGroupsAtom)
    const addResourceDropdownItems = useAddResourceDropdownItems(true)
    const addResource = useAddResourceToEnhancerGroup(props.id)
    const [extend, setExtend] = useState<boolean>(false)
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 5
    const removeEnhancerGroup = useRemoveEnhancerGroup(props.id)
    useEffect(()=>{
        const effect = async ()=>{
            setGroup(await getEnhancerGroupById(props.id))
            setEnhancerIds((await getEnhancersByGroupId(props.id)).filter(enhancer=>!!enhancer).map(enhancer=>enhancer.id))
            setResources(await getResourcesByGroupId(props.id))
            setTraceInfo(await getStudyTraceEnhancerGroupInfo(props.id))
        }; effect().then()
        //eslint-disable-next-line
    }, [props.id])
    useEffect(()=>{
        setAncestorEnhancerGroups((groups)=>groups.filter(g=>!!g).map(g=>g.id===props.id ? group : g))
        //eslint-disable-next-line
    }, [group])


    if(!group) return <></>
    return (
        <div>
            <Row>
                <Col span={10}>{
                    !props.hideName && (
                    props.readonly ?
                    <span
                        className={classes.title}
                        style={{padding:"0.5em"}}>
                        {group.title}
                    </span> :
                    <Input
                        value={group.title}
                        onChange={({target: {value}}) => setGroup({...group, title: value})}
                        onBlur={() => setEnhancerGroupTitle(props.id, group.title)}
                        placeholder={". . ."}
                        className={classes.title}
                        bordered={false}/>
                )}</Col>
                <Col span={3} className={classes.tag_wrapper}>{
                    traceInfo &&
                    traceInfo.duration &&
                    traceInfo.duration !== 0 &&
                    <Tooltip title={"学习时长（时：分）"}>
                        <FieldTimeOutlined style={{position:"relative", left:"-1em"}}/>
                        <span className={classes.date}>{formatMillisecondsToHHMM(traceInfo.duration * 1000)}</span>
                    </Tooltip>
                }</Col>
                <Col span={2} offset={9} className={classes.tag_wrapper}>{
                    !props.readonly &&
                    <Dropdown menu={{items: addResourceDropdownItems, onClick: (data)=>addResource(data.key)}}>
                        <PlusOutlined className={utils.icon_button}/>
                    </Dropdown>
                }</Col>
            </Row>
            <Row>
                <Col span={24}>{
                    resources
                        .filter(resource=>!!resource)
                        .map(resource=>(
                        <Row key={resource.id}>
                            <Col span={22}>
                                <ResourcePlayer resource={resource} readonly={props.readonly}/>
                            </Col>
                            <Col span={2}>{
                                props.readonly ? <></>:
                                <MinusOutlined
                                    className={`${classes.resource_delete} ${utils.icon_button}`}
                                    onClick={async ()=>{
                                        await removeResourceFromEnhancerGroup(props.id, resource.id!)
                                        setResources(resources.filter(temp=>temp.id !== resource.id))
                                    }}/>
                            }</Col>
                        </Row>
                    ))
                }</Col>
            </Row>
            <div className={classes.main_part}>
                <Row>
                    <Col span={1}>
                    </Col>
                    <Col span={22}>{
                        (extend ? enhancerIds : enhancerIds.slice(0, 1))
                            .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                            .map((id)=><EnhancerCard key={id} id={id} readonly={props.readonly} fromGroup={props.id}/>)
                    }</Col>
                </Row>
                <Row>
                    <Col span={23} offset={1}>
                        <Pagination
                            style={{marginTop:"1em"}}
                            onChange={(page)=>setCurrentPage(page)}
                            current={currentPage}
                            pageSize={pageSize}
                            hideOnSinglePage={true}
                            total={enhancerIds.length}/>
                    </Col>
                </Row>
            </div>
            <Row style={{paddingTop:"0.5em"}}>
                <Col span={22}>{
                    !extend ?
                    <div
                        className={`${classes.extend_prompt} ${utils.icon_button_normal}`}
                        onClick={()=>setExtend(true)}>
                        点击展开
                    </div> :
                    <div
                        className={`${classes.extend_prompt} ${utils.icon_button_normal}`}
                        onClick={()=>setExtend(false)}>
                        点击收回
                    </div>
                }</Col>
                <Col span={2}>{
                    !props.readonly &&
                    <DeleteOutlined
                        className={`${classes.delete} ${utils.icon_button}`}
                        onClick={()=>removeEnhancerGroup()}/>
                }</Col>
            </Row>
        </div>
    );
};

export default EnhancerGroupCard;