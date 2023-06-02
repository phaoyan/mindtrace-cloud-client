import {
    FileSearchOutlined,
    FileTextOutlined,
    InteractionOutlined,
    LinkOutlined, ShareAltOutlined,
    SwitcherOutlined
} from "@ant-design/icons";
import classes from "../../components/home/info/enhancer/EnhancerCard.module.css";
import React from "react";
import QuizcardPlayer from "../../components/home/info/enhancer/resource/QuizcardPlayer";
import MarkdownPlayer from "../../components/home/info/enhancer/resource/MarkdownPlayer";
import LinkoutPlayer from "../../components/home/info/enhancer/resource/LinkoutPlayer";
import ClozePlayer from "../../components/home/info/enhancer/resource/ClozePlayer";
import UnfoldingPlayer from "../../components/home/info/enhancer/resource/UnfoldingPlayer";
import MindtraceHubResourcePlayer from "../../components/home/info/enhancer/resource/MindtraceHubResourcePlayer";


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

export const quizcardTemplate = (userId:number)=> (
    {
        meta: {
            type: ResourceType.QUIZCARD,
            createBy: userId
        },
        data: {
            front: "",
            back: "",
            config:{
                frontLatexDisplayMode: true,
                backLatexDisplayMode: true
            }
        }
    }
)

export const markdownTemplate = (userId: number)=>({
    meta: {
        type: ResourceType.MARKDOWN,
        createBy: userId
    },
    data: {
        content: "",
        config:{
            hide: false,
            latexDisplayMode: true
        }
    }
})

export const linkoutTemplate = (userId: number)=>({
    meta:{
        type: ResourceType.LINKOUT,
        createBy: userId
    },
    data:{
        type:"default",
        url:"https://www.bing.com"
    }
})

export const clozeTemplate = (userId: number)=>({
    meta:{
        type: ResourceType.CLOZE,
        createBy: userId
    },
    data:{
        raw: ""
    }
})

export const unfoldingTemplate = (userId:number)=>({
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

export const mindtraceHubResourceTemplate = (userId: number)=>({
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
export const addResourceDropdownItems = (handleAddAction: (resourceWithData: ResourceWithData)=>any, userId: number)=> [
    {
        key: ResourceType.QUIZCARD,
        label: "知识卡片",
        icon: <SwitcherOutlined className={classes.option}/>,
        onClick: ()=>handleAddAction(quizcardTemplate(userId))
    },
    {
        key: ResourceType.MARKDOWN,
        label: "知识概述",
        icon: <FileTextOutlined className={classes.option}/>,
        onClick: ()=>handleAddAction(markdownTemplate(userId))
    },
    {
        key: ResourceType.CLOZE,
        label: "填空卡片",
        icon: <FileSearchOutlined className={classes.option}/>,
        onClick: ()=>handleAddAction(clozeTemplate(userId))
    },
    {
        key: ResourceType.LINKOUT,
        label: "资源链接",
        icon: <LinkOutlined className={classes.option}/>,
        onClick: ()=>handleAddAction(linkoutTemplate(userId))
    },
    {
        key: ResourceType.MINDTRACE_HUB_RESOURCE,
        label: "云端资源",
        icon: <ShareAltOutlined className={classes.option}/>,
        onClick: ()=>handleAddAction(mindtraceHubResourceTemplate(userId))
    },
    {
        key: ResourceType.UNFOLDING,
        label: "知识梳理",
        icon: <InteractionOutlined className={classes.option}/>,
        onClick: ()=>handleAddAction(unfoldingTemplate(userId))
    }
]
/**
 *  在此处注册 Resource
 */
export const resourceTypePlayerMapper = {
    [ResourceType.QUIZCARD]: (meta: Resource, readonly:boolean) => <QuizcardPlayer meta={meta} readonly={readonly}/>,
    [ResourceType.MARKDOWN]: (meta: Resource, readonly:boolean) => <MarkdownPlayer meta={meta} readonly={readonly}/>,
    [ResourceType.LINKOUT]: (meta: Resource, readonly:boolean) => <LinkoutPlayer  meta={meta} readonly={readonly}/>,
    [ResourceType.CLOZE]: (meta: Resource, readonly:boolean) => <ClozePlayer    meta={meta} readonly={readonly}/>,
    [ResourceType.UNFOLDING]: (meta: Resource, readonly:boolean)=> <UnfoldingPlayer meta={meta} readonly={readonly}/>,
    [ResourceType.MINDTRACE_HUB_RESOURCE]: (meta: Resource, readonly:boolean)=> <MindtraceHubResourcePlayer meta={meta} readonly={readonly}/>
}

export const ResourcePlayer = (props:{resource: Resource, readonly? : boolean })=>{
    if(props.resource.type && Object.values(ResourceType).includes(props.resource.type!))
        return resourceTypePlayerMapper[props.resource.type!](props.resource, !!props.readonly)
    return <></>
}