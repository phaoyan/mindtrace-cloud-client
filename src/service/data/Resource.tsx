import {addDataToResource} from "../api/ResourceApi";
import {ENHANCER_HOST} from "../api/EnhancerApi";
import {FileTextOutlined, SwitcherOutlined} from "@ant-design/icons";
import classes from "../../components/home/info/enhancer/EnhancerCard.module.css";
import React from "react";
import QuizcardPlayer from "../../components/home/info/enhancer/resource/QuizcardPlayer";
import MarkdownPlayer from "../../components/home/info/enhancer/resource/MarkdownPlayer";


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
            type: "quizcard",
            createBy: userId
        },
        data: {
            front: "",
            back: "",
            imgs:{}
        }
    }
)

export const markdownTemplate = (userId: number)=>(
    {
        meta: {
            type: "markdown",
            createBy: userId
        },
        data: {
            content: ""
        }
    }
)

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
    }
]
/**
 *  在此处注册 Resource
 */
export const resourceTypePlayerMapper = {
    [ResourceType.QUIZCARD]: (meta: Resource) => <QuizcardPlayer meta={meta}/>,
    [ResourceType.MARKDOWN]: (meta: Resource) => <MarkdownPlayer meta={meta}/>
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