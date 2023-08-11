import {atomFamily, useRecoilState} from "recoil";
import {defaultEnhancer, Enhancer} from "../../../../../service/data/Enhancer";
import {
    FileSearchOutlined,
    FileTextOutlined, InteractionOutlined,
    LinkOutlined,
    ShareAltOutlined, SoundOutlined,
    SwitcherOutlined
} from "@ant-design/icons";
import classes from "./EnhancerCard.module.css";
import QuizcardPlayer from "../resource/QuizCardPlayer/QuizcardPlayer";
import MarkdownPlayer from "../resource/MarkdownPlayer/MarkdownPlayer";
import LinkoutPlayer from "../resource/LinkoutPlayer/LinkoutPlayer";
import ClozePlayer from "../resource/ClozePlayer/ClozePlayer";
import MindtraceHubResourcePlayer from "../resource/MindtraceHubResourcePlayer/MindtraceHubResourcePlayer";
import React from "react";
import AudioPlayer from "../resource/AudioPlayer/AudioPlayer";
import {addResource} from "../../../../../service/api/ResourceApi";

export const EnhancerAtomFamily = atomFamily<Enhancer, number>({
    key: "EnhancerAtomFamily",
    default: defaultEnhancer
})
export const EnhancerResourcesAtomFamily = atomFamily<Resource[], number>({
    key: "EnhancerResourcesAtomFamily",
    default: []
})

export const useAddResource = (enhancerId: number)=>{
    const [resources, setResources] = useRecoilState(EnhancerResourcesAtomFamily(enhancerId))
    return async (enhancerId: number, type: string)=>{
         setResources([...resources, await addResource(enhancerId, {type: type})])
    }
}

export const useAddResourceDropdownItems = (enhancerId: number)=>{
    const addResource = useAddResource(enhancerId)
    return [
        {
            key: ResourceType.QUIZCARD,
            label: "知识卡片",
            icon: <SwitcherOutlined className={classes.option}/>,
            onClick: ()=>addResource(enhancerId, ResourceType.QUIZCARD)
        },
        {
            key: ResourceType.MARKDOWN,
            label: "知识概述",
            icon: <FileTextOutlined className={classes.option}/>,
            onClick: ()=>addResource(enhancerId, ResourceType.MARKDOWN)
        },
        {
            key: ResourceType.CLOZE,
            label: "填空卡片",
            icon: <FileSearchOutlined className={classes.option}/>,
            onClick: ()=>addResource(enhancerId, ResourceType.CLOZE)
        },
        {
            key: ResourceType.LINKOUT,
            label: "资源链接",
            icon: <LinkOutlined className={classes.option}/>,
            onClick: ()=>addResource(enhancerId, ResourceType.LINKOUT)
        },
        {
            key: ResourceType.MINDTRACE_HUB_RESOURCE,
            label: "云端资源",
            icon: <ShareAltOutlined className={classes.option}/>,
            onClick: ()=>addResource(enhancerId, ResourceType.MINDTRACE_HUB_RESOURCE)
        },
        {
            key: ResourceType.UNFOLDING,
            label: "知识梳理",
            icon: <InteractionOutlined className={classes.option}/>,
            onClick: ()=>addResource(enhancerId, ResourceType.UNFOLDING)
        },
        {
            key: ResourceType.AUDIO,
            label: "音频资源",
            icon: <SoundOutlined className={classes.option}/>,
            onClick: ()=>addResource(enhancerId, ResourceType.AUDIO)
        }
    ]
}


export interface Resource {
    id?: number,
    title?: string,
    type?: string,
    createTime?: string,
    createBy: number,
    privacy?: string
}

export interface ResourceWithData {
    meta: Resource,
    data: any
}

export const ResourceType = {
    QUIZCARD: "quizcard",
    MARKDOWN: "markdown",
    LINKOUT: "linkout",
    CLOZE: "cloze",
    GPT_PROMPTS: "gpt prompts",
    AUDIO: "audio",
    VIDEO: "video",
    PROJECT: "project",
    LINK_SCRIPT: "link script",
    ASSOCIATED_RESOURCE: "associated resource",
    HIDDEN_KNODE_SET: "hidden knode set",
    STROKE: "stroke",
    UNFOLDING: "unfolding",
    MINDTRACE_HUB_RESOURCE: "mindtrace hub resource"
}

export const unfoldingTemplate = (userId:number): ResourceWithData=>({
    meta:{
        type: ResourceType.UNFOLDING,
        createBy: userId
    },
    data:{
        knodes:[{
            title:"",
            chainStyleTitle: [],
            knodeId:-1,
            stemId:-1,
            unfolded:false,
            tag:false
        }],
        configs:{
            hotUpdate: true
        }
    }
})

export const mindtraceHubResourceTemplate = (userId: number): ResourceWithData=>({
    meta:{
        type: ResourceType.MINDTRACE_HUB_RESOURCE,
        createBy: userId
    },
    data:{
        id: 0,
        url: "",
        title: "",
        contentType: "application/pdf",
        size: 0
    }
})
/**
 *  在此处注册 Resource
 */
export const resourceTypePlayerMapper = {
    [ResourceType.QUIZCARD]: (meta: Resource, readonly:boolean) => <QuizcardPlayer meta={meta} readonly={readonly}/>,
    [ResourceType.MARKDOWN]: (meta: Resource, readonly:boolean) => <MarkdownPlayer meta={meta} readonly={readonly}/>,
    [ResourceType.LINKOUT]: (meta: Resource, readonly:boolean) => <LinkoutPlayer  meta={meta} readonly={readonly}/>,
    [ResourceType.CLOZE]: (meta: Resource, readonly:boolean) => <ClozePlayer    meta={meta} readonly={readonly}/>,
    [ResourceType.MINDTRACE_HUB_RESOURCE]: (meta: Resource, readonly:boolean)=> <MindtraceHubResourcePlayer meta={meta} readonly={readonly}/>,
    [ResourceType.AUDIO]: (meta: Resource, readonly:boolean)=> <AudioPlayer meta={meta} readonly={readonly}/>
}

export const ResourcePlayer = (props:{resource: Resource, readonly? : boolean })=>{
    try{
        return resourceTypePlayerMapper[props.resource.type!](props.resource, !!props.readonly)
    }catch (err){
        return <></>
    }
}