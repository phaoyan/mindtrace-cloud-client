import React, {useEffect, useRef, useState,} from 'react';
import {Col, Dropdown, Input, Row} from "antd";
import {
    EnhancerGroupAtomFamily, EnhancerGroupResourcesAtomFamily,
    GroupRelatedEnhancerIdsAtomFamily,
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
import {DeleteOutlined, MinusOutlined, PlusOutlined} from "@ant-design/icons";
import classes from "./EnhancerGroupCard.module.css"
import utils from "../../../../../utils.module.css"
import {removeResourceFromEnhancerGroup} from "../../../../../service/api/ResourceApi";

const EnhancerGroupCard = (props:{id: number, hideName?: boolean, readonly?: boolean}) => {

    const [group, setGroup] = useRecoilState(EnhancerGroupAtomFamily(props.id))
    const [enhancerIds, setEnhancerIds] = useRecoilState(GroupRelatedEnhancerIdsAtomFamily(props.id))
    const [resources, setResources] = useRecoilState(EnhancerGroupResourcesAtomFamily(props.id))
    const [, setAncestorEnhancerGroups] = useRecoilState(SelectedKnodeAncestorEnhancerGroupsAtom)
    const addResourceDropdownItems = useAddResourceDropdownItems(true)
    const addResource = useAddResourceToEnhancerGroup(props.id)
    const mainPart = useRef(null)
    const [maxHeight, setMaxHeight] = useState<number | undefined>(200)
    const removeEnhancerGroup = useRemoveEnhancerGroup(props.id)
    useEffect(()=>{
        const effect = async ()=>{
            setGroup(await getEnhancerGroupById(props.id))
            setEnhancerIds((await getEnhancersByGroupId(props.id)).map(enhancer=>enhancer.id))
            setResources(await getResourcesByGroupId(props.id))
        }; effect().then()
        //eslint-disable-next-line
    }, [props.id])
    useEffect(()=>{
        setAncestorEnhancerGroups((groups)=>groups.map(g=>g.id===props.id ? group : g))
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
                <Col span={2} offset={12} className={classes.tag_wrapper}>{
                    !props.readonly &&
                    <Dropdown menu={{items: addResourceDropdownItems, onClick: (data)=>addResource(data.key)}}>
                        <PlusOutlined className={utils.icon_button}/>
                    </Dropdown>
                }</Col>
            </Row>
            <Row>
                <Col span={24}>{
                    resources

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
            <Row className={classes.main_part} ref={mainPart} style={{maxHeight: maxHeight}}>
                <Col span={1}>
                </Col>
                <Col span={22}>{
                    enhancerIds.map((id)=><EnhancerCard key={id} id={id} readonly={props.readonly}/>)
                }</Col>
            </Row>
            <Row style={{paddingTop:"0.5em"}}>
                <Col span={22}>{
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