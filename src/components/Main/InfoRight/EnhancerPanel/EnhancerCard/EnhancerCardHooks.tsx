import {atom, atomFamily, useRecoilState, useRecoilValue} from "recoil";
import {defaultEnhancer, Enhancer} from "../../../../../service/data/Enhancer";
import {
    ApiOutlined,
    FileSearchOutlined,
    FileTextOutlined,
    LinkOutlined,
    ShareAltOutlined, SnippetsOutlined, SoundOutlined,
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
import {addEnhancerResourceRel, addResource, getResourcesFromEnhancer} from "../../../../../service/api/ResourceApi";
import {
    addEnhancerGroupRel,
    addEnhancerGroupToKnode,
    addEnhancerToKnode, getEnhancersByGroupId,
    getEnhancersForKnode, setEnhancerIndexInEnhancerGroup,
    setEnhancerIndexInKnode,
    setResourceIndexInEnhancer
} from "../../../../../service/api/EnhancerApi";
import {EnhancersForSelectedKnodeAtom} from "../../../../../recoil/home/Enhancer";
import {SelectedKnodeIdAtom} from "../../../../../recoil/home/Knode";
import NoteLinkPlayer from "../resource/NoteLinkPlayer/NoteLinkPlayer";
import {LoginUserIdSelector} from "../../../../Login/LoginHooks";
import {EnhancerPanelKeyAtom} from "../../../../../recoil/utils/DocumentData";
import {
    CurrentStudyAtom,
    useAddEnhancerId,
    useAddKnodeId
} from "../../RecordPanel/CurrentStudyRecord/CurrentStudyRecordHooks";
import KnodeLinkPlayer from "../resource/KnodeLinkPlayer/KnodeLinkPlayer";

export const EnhancerAtomFamily = atomFamily<Enhancer, number>({
    key: "EnhancerAtomFamily",
    default: defaultEnhancer
})
export const EnhancerResourcesAtomFamily = atomFamily<Resource[], number>({
    key: "EnhancerResourcesAtomFamily",
    default: []
})

export const CopiedResourceIdsAtom = atom<number[]>({
    key: "CopiedResourceIdAtom",
    default: []
})

export const usePasteResources = (enhancerId: number)=>{
    const [copiedResourceIds, setCopiedResourceIds] = useRecoilState(CopiedResourceIdsAtom)
    const [, setResources] = useRecoilState(EnhancerResourcesAtomFamily(enhancerId))
    return async ()=>{
        for (let resourceId of copiedResourceIds)
            await addEnhancerResourceRel(enhancerId, resourceId)
        setResources(await getResourcesFromEnhancer(enhancerId))
        setCopiedResourceIds([])
    }
}

export const useAddResource = (enhancerId: number)=>{
    const [resources, setResources] = useRecoilState(EnhancerResourcesAtomFamily(enhancerId))
    return async (type: string)=>{
         setResources([...resources, await addResource(enhancerId, {type: type})])
    }
}

export const useAddResourceDropdownItems = (disableNoteLink?: boolean)=>{

    const res = [
        {
            key: ResourceType.QUIZCARD,
            label: "知识卡片",
            icon: <SwitcherOutlined className={classes.option}/>,
        },
        {
            key: ResourceType.MARKDOWN,
            label: "知识概述",
            icon: <FileTextOutlined className={classes.option}/>,
        },
        {
            key: ResourceType.CLOZE,
            label: "填空卡片",
            icon: <FileSearchOutlined className={classes.option}/>,
        },
        {
            key: ResourceType.LINKOUT,
            label: "资源链接",
            icon: <LinkOutlined className={classes.option}/>,
        },
        {
            key: ResourceType.MINDTRACE_HUB_RESOURCE,
            label: "云端资源",
            icon: <ShareAltOutlined className={classes.option}/>,
        },
        {
            key: ResourceType.AUDIO,
            label: "音频资源",
            icon: <SoundOutlined className={classes.option}/>,
        }
    ]

    if(!disableNoteLink){
        res.push({
            key: ResourceType.NOTE_LINK,
            label: "笔记链接",
            icon: <SnippetsOutlined className={classes.option}/>,
        })
        res.push({
            key: ResourceType.KNODE_LINK,
            label: "知识链接",
            icon: <ApiOutlined />
        })
    }


    return res
}

export const useAddEnhancer = ()=>{
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [, setEnhancers] = useRecoilState(EnhancersForSelectedKnodeAtom)
    const [currentStudy, ] = useRecoilState(CurrentStudyAtom)
    const addEnhancerIdToCurrentStudy = useAddEnhancerId()
    const addKnodeIdToCurrentStudy = useAddKnodeId()
    return async (data: any)=>{
        if(data.key === ResourceType.ENHANCER_GROUP) return
        const enhancer = await addEnhancerToKnode(selectedKnodeId)
        await setEnhancerIndexInKnode(selectedKnodeId, enhancer.id, 0)
        await addResource(enhancer.id, {type: data.key})
        setEnhancers(await getEnhancersForKnode(selectedKnodeId))
        if(!!currentStudy){
            await addEnhancerIdToCurrentStudy(enhancer.id)
            await addKnodeIdToCurrentStudy(selectedKnodeId)
        }
        return enhancer.id
    }
}

export const useAddEnhancerGroup = ()=>{
    const userId = useRecoilValue(LoginUserIdSelector);
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [, setEnhancerPanelKey] = useRecoilState(EnhancerPanelKeyAtom);
    return async ()=>{
        await addEnhancerGroupToKnode(userId, selectedKnodeId)
        setEnhancerPanelKey((key)=>key + 1)
    }
}

export const useShiftEnhancer = ()=>{
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [enhancers, setEnhancers] = useRecoilState(EnhancersForSelectedKnodeAtom);
    return async (knodeId: number, enhancerId: number, shift: number)=>{
        await setEnhancerIndexInKnode(knodeId, enhancerId, enhancers.findIndex((enhancer)=>enhancer.id === enhancerId) + shift)
        setEnhancers(await getEnhancersForKnode(selectedKnodeId))
    }
}

export const useShiftEnhancerInGroup = ()=>{
    const [, setEnhancerPanelKey] = useRecoilState(EnhancerPanelKeyAtom)
    return async (groupId: number, enhancerId: number, shift: number)=>{
        const enhancers = await getEnhancersByGroupId(groupId);
        await setEnhancerIndexInEnhancerGroup(groupId, enhancerId, enhancers.findIndex(enhancer=>enhancer.id===enhancerId) + shift)
        setEnhancerPanelKey((key)=>key + 1)
    }
}

export const useShiftResource = (enhancerId: number)=>{
    const [resources, setResources] = useRecoilState(EnhancerResourcesAtomFamily(enhancerId))
    return async (resourceId: number, shift: number)=>{
        const index1 = resources.findIndex((resource)=>resource.id === resourceId)
        const index2 = index1 + shift
        if(index2 < 0 || index2 > resources.length - 1) return
        await setResourceIndexInEnhancer(enhancerId, resourceId, index2)
        setResources(await getResourcesFromEnhancer(enhancerId))
    }
}

export const useAddEnhancerToGroup = (enhancerId: number)=>{
    const [, setEnhancerPanelKey] = useRecoilState(EnhancerPanelKeyAtom);
    return async (groupId: any)=>{
        await addEnhancerGroupRel(enhancerId, groupId)
        setEnhancerPanelKey((key)=>key + 1)
    }
}


export interface Resource {
    id?: number,
    title?: string,
    type?: string,
    createTime?: string,
    createBy: number,
    privacy?: string
}

export const ResourceType = {
    QUIZCARD: "quizcard",
    MARKDOWN: "markdown",
    LINKOUT: "linkout",
    NOTE_LINK: "note link",
    KNODE_LINK: "knode link",
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
    MINDTRACE_HUB_RESOURCE: "mindtrace hub resource",
    ENHANCER_GROUP: "enhancer group"
}

/**
 *  在此处注册 Resource
 */
export const resourceTypePlayerMapper = {
    [ResourceType.QUIZCARD]: (meta: Resource, readonly:boolean) => <QuizcardPlayer meta={meta} readonly={readonly}/>,
    [ResourceType.MARKDOWN]: (meta: Resource, readonly:boolean) => <MarkdownPlayer meta={meta} readonly={readonly}/>,
    [ResourceType.LINKOUT]: (meta: Resource, readonly:boolean) => <LinkoutPlayer  meta={meta} readonly={readonly}/>,
    [ResourceType.CLOZE]: (meta: Resource, readonly:boolean) => <ClozePlayer    meta={meta} readonly={readonly}/>,
    [ResourceType.MINDTRACE_HUB_RESOURCE]: (meta: Resource, readonly:boolean)=> <MindtraceHubResourcePlayer meta={meta} readonly={readonly}/>,
    [ResourceType.AUDIO]: (meta: Resource, readonly:boolean)=> <AudioPlayer meta={meta} readonly={readonly}/>,
    [ResourceType.NOTE_LINK]: (meta: Resource, readonly:boolean)=> <NoteLinkPlayer meta={meta} readonly={readonly}/>,
    [ResourceType.KNODE_LINK]: (meta: Resource, readonly:boolean)=> <KnodeLinkPlayer meta={meta} readonly={readonly}/>
}

export const ResourcePlayer = (props:{resource: Resource, readonly? : boolean })=>{
    try{
        return resourceTypePlayerMapper[props.resource.type!](props.resource, !!props.readonly)
    }catch (err){
        return <></>
    }
}