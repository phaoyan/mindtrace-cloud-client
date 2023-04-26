import {addDataToResource} from "../api/ResourceApi";
import {ENHANCER_HOST} from "../api/EnhancerApi";
import {FileSearchOutlined, FileTextOutlined, LinkOutlined, SwitcherOutlined} from "@ant-design/icons";
import classes from "../../components/home/info/enhancer/EnhancerCard.module.css";
import React from "react";
import QuizcardPlayer from "../../components/home/info/enhancer/resource/QuizcardPlayer";
import MarkdownPlayer from "../../components/home/info/enhancer/resource/MarkdownPlayer";
import LinkoutPlayer from "../../components/home/info/enhancer/resource/LinkoutPlayer";
import ClozePlayer from "../../components/home/info/enhancer/resource/ClozePlayer";


export interface Resource {
    id?: number,
    title?: string,
    type?: string,
    createTime?: string,
    createBy?: number,
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
    STROKE: "stroke"
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
            imgs:{}
        }
    }
)

export const markdownTemplate = (userId: number)=>({
    meta: {
        type: ResourceType.MARKDOWN,
        createBy: userId
    },
    data: {
        content: ""
    }
})

export const linkoutTemplate = (userId: number)=>({
    meta:{
        type: ResourceType.LINKOUT,
        createBy: userId
    },
    data:{
        type:"default",
        url:"www.bilibili.com"
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
    }
]
/**
 *  在此处注册 Resource
 */
export const resourceTypePlayerMapper = {
    [ResourceType.QUIZCARD]: (meta: Resource) => <QuizcardPlayer meta={meta}/>,
    [ResourceType.MARKDOWN]: (meta: Resource) => <MarkdownPlayer meta={meta}/>,
    [ResourceType.LINKOUT]:  (meta: Resource) => <LinkoutPlayer  meta={meta}/>,
    [ResourceType.CLOZE]:    (meta: Resource) => <ClozePlayer    meta={meta}/>
}

export const handleUploadImage =
    (imageFile: File, userId: number, resourceId: number) =>
        new Promise<string>(resolve => {
            const reader = new FileReader()
            reader.readAsDataURL(imageFile)
            reader.onload = async (event) => {
                const imgName = new Date().toISOString().slice(0, 19).replaceAll(":", "-") + "." + imageFile.type.replace("image/", "")
                event.target &&
                resourceId &&
                await addDataToResource(userId, resourceId, {
                    imgs: {
                        [imgName]: event.target.result
                    }
                })
                resolve(`![](${ENHANCER_HOST}/user/${userId}/resource/${resourceId}/data/${imgName})`)
            }
        })