import React, {useEffect} from 'react';
import classes from "./EnhancerCard.module.css";
import {Col, Dropdown, Input, Row, Tooltip} from "antd";
import {
    BookOutlined,
    DeleteOutlined, FormOutlined,
    MinusOutlined,
    PlusOutlined,
    ScissorOutlined
} from "@ant-design/icons";
import utils from "../../../../../utils.module.css"
import {getEnhancerById, setEnhancerIsQuiz, setEnhancerTitle} from "../../../../../service/api/EnhancerApi";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {getResourcesFromEnhancer, removeResource} from "../../../../../service/api/ResourceApi";
import {EnhancerCardIdClipboardAtom} from "../../../../../recoil/home/Enhancer";
import {SelectedKnodeIdAtom} from "../../../../../recoil/home/Knode";
import {MessageApiAtom} from "../../../../../recoil/utils/DocumentData";
import {
    EnhancerAtomFamily,
    EnhancerResourcesAtomFamily, ResourcePlayer,
    useAddResourceDropdownItems
} from "./EnhancerCardHooks";
import {useHandleRemoveEnhancer} from "../EnhancerPanelHooks";
import dayjs from "dayjs";

export const EnhancerCard = (props: { id: number, readonly? : boolean}) => {

    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [enhancer, setEnhancer] = useRecoilState(EnhancerAtomFamily(props.id))
    const [resources, setResources] = useRecoilState(EnhancerResourcesAtomFamily(props.id))
    const setEnhancerIdClipboard = useSetRecoilState(EnhancerCardIdClipboardAtom)
    const messageApi = useRecoilValue(MessageApiAtom)
    const addResourceDropdownItems = useAddResourceDropdownItems(props.id)
    const handleRemove = useHandleRemoveEnhancer()

    useEffect(()=>{
        const init = async ()=>{
            setEnhancer(await getEnhancerById(props.id))
            setResources(await getResourcesFromEnhancer(props.id))
        };init()
        //eslint-disable-next-line
    }, [props.id])

    return (
        <div className={classes.container}>
            <div className={classes.header_part}>
                <Row>
                    <Col span={10}>{
                        props.readonly ?
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
                            bordered={false}/>
                    }</Col>
                    <Col span={9} className={classes.tag_wrapper}>
                        <span className={classes.date}>{dayjs(enhancer.createTime).format("YYYY-MM-DD")}</span>
                    </Col>
                    <Col span={1}>{
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
                                messageApi.success("笔记剪切成功")
                            }}/>
                    }</Col>
                    <Col span={1} offset={1}>{
                        !props.readonly &&
                        <Dropdown
                            menu={{items: addResourceDropdownItems}}>
                            <PlusOutlined className={utils.icon_button}/>
                        </Dropdown>
                    }</Col>
                </Row>
            </div>

            <div className={classes.main_part}>
                {resources.map(resource => (
                    <Row key={resource.id}>
                        <Col span={23}>
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

            <Row>
                <Col span={1} offset={23}>{
                    !props.readonly &&
                    <DeleteOutlined
                        className={utils.icon_button}
                        onClick={()=>handleRemove(enhancer.id)}/>
                }</Col>
            </Row>

        </div>
    )
}

