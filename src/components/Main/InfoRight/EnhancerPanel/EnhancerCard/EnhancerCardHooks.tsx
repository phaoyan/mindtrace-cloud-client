import {atomFamily, useRecoilState, useRecoilValue} from "recoil";
import {defaultEnhancer, Enhancer} from "../../../../../service/data/Enhancer";
import {
    FileSearchOutlined,
    FileTextOutlined, InteractionOutlined,
    LinkOutlined,
    ShareAltOutlined,
    SwitcherOutlined
} from "@ant-design/icons";
import classes from "./EnhancerCard.module.css";
import QuizcardPlayer from "../resource/QuizcardPlayer";
import MarkdownPlayer from "../resource/MarkdownPlayer";
import LinkoutPlayer from "../resource/LinkoutPlayer";
import ClozePlayer from "../resource/ClozePlayer";
import UnfoldingPlayer from "../resource/UnfoldingPlayer";
import MindtraceHubResourcePlayer from "../resource/MindtraceHubResourcePlayer";
import React from "react";
import {addResourceToEnhancer} from "../../../../../service/api/ResourceApi";
import {LoginUserIdSelector} from "../../../../Login/LoginHooks";

export const EnhancerAtomFamily = atomFamily<Enhancer, number>({
    key: "EnhancerAtomFamily",
    default: defaultEnhancer
})
export const EnhancerResourcesAtomFamily = atomFamily<Resource[], number>({
    key: "EnhancerResourcesAtomFamily",
    default: []
})


export const useAddResourceDropdownItems = (enhancerId: number)=>{
    const userId = useRecoilValue(LoginUserIdSelector)
    const [resources, setResources] = useRecoilState(EnhancerResourcesAtomFamily(enhancerId))
    return [
        {
            key: ResourceType.QUIZCARD,
            label: "知识卡片",
            icon: <SwitcherOutlined className={classes.option}/>,
            onClick: async ()=>setResources([...resources, await addResourceToEnhancer(enhancerId, quizcardTemplate(userId))])
        },
        {
            key: ResourceType.MARKDOWN,
            label: "知识概述",
            icon: <FileTextOutlined className={classes.option}/>,
            onClick: async ()=>setResources([...resources, await addResourceToEnhancer(enhancerId, markdownTemplate(userId))])
        },
        {
            key: ResourceType.CLOZE,
            label: "填空卡片",
            icon: <FileSearchOutlined className={classes.option}/>,
            onClick: async ()=>setResources([...resources, await addResourceToEnhancer(enhancerId, clozeTemplate(userId))])
        },
        {
            key: ResourceType.LINKOUT,
            label: "资源链接",
            icon: <LinkOutlined className={classes.option}/>,
            onClick: async ()=>setResources([...resources, await addResourceToEnhancer(enhancerId, linkoutTemplate(userId))])
        },
        {
            key: ResourceType.MINDTRACE_HUB_RESOURCE,
            label: "云端资源",
            icon: <ShareAltOutlined className={classes.option}/>,
            onClick: async ()=>setResources([...resources, await addResourceToEnhancer(enhancerId, mindtraceHubResourceTemplate(userId))])
        },
        {
            key: ResourceType.UNFOLDING,
            label: "知识梳理",
            icon: <InteractionOutlined className={classes.option}/>,
            onClick: async ()=>setResources([...resources, await addResourceToEnhancer(enhancerId, unfoldingTemplate(userId))])
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

export const quizcardTemplate = (userId:number): ResourceWithData=> (
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

export const markdownTemplate = (userId: number): ResourceWithData=>({
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

export const linkoutTemplate = (userId: number): ResourceWithData=>({
    meta:{
        type: ResourceType.LINKOUT,
        createBy: userId
    },
    data:{
        type:"default",
        url:"https://www.bing.com"
    }
})

export const clozeTemplate = (userId: number): ResourceWithData=>({
    meta:{
        type: ResourceType.CLOZE,
        createBy: userId
    },
    data:{
        raw: ""
    }
})

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
    [ResourceType.UNFOLDING]: (meta: Resource, readonly:boolean)=> <UnfoldingPlayer meta={meta} readonly={readonly}/>,
    [ResourceType.MINDTRACE_HUB_RESOURCE]: (meta: Resource, readonly:boolean)=> <MindtraceHubResourcePlayer meta={meta} readonly={readonly}/>
}

export const ResourcePlayer = (props:{resource: Resource, readonly? : boolean })=>{
    if(props.resource.type && Object.values(ResourceType).includes(props.resource.type!))
        return resourceTypePlayerMapper[props.resource.type!](props.resource, !!props.readonly)
    return <></>
}