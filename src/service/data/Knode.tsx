import {BreadcrumbItemType} from "antd/es/breadcrumb/Breadcrumb";
import MdPreview from "../../components/utils/markdown/MdPreview";
import React from "react";
import {useJumpToKnode} from "../../components/Main/Main/MainHooks";
import utils from "../../utils.module.css"


export interface Knode {
    id: number,
    index: number,
    title: string,
    labels: any[],
    stemId: number | null,
    branchIds: number[],
    connectionIds: number[],
    createBy: number,
    createTime: string,
    privacy: string,
    isLeaf?:boolean
}

export interface Ktree {
    knode: Knode,
    branches: Ktree[]
}

export interface KtreeAntd {
    key: number,
    title: any,
    children: KtreeAntd[]
}

export const getBrotherBranchIds = (ktree: Ktree, knodeId: number): number[] | undefined=>{
    const branchIds = ktree.branches.map(branch=>branch.knode.id);
    if(branchIds.includes(knodeId))
        return branchIds
    else for (let branch of ktree.branches){
        let result = getBrotherBranchIds(branch, knodeId);
        if(result) return result
    }
}

export const breadcrumbTitle = (chainStyleTitle: string[], include?: boolean):BreadcrumbItemType[]=>{
    if(chainStyleTitle)
        return chainStyleTitle
            .filter(title=>{
                if(include) return chainStyleTitle.indexOf(title) !== chainStyleTitle.length-1
                else return chainStyleTitle.indexOf(title) !== 0 && chainStyleTitle.indexOf(title) !== chainStyleTitle.length-1
            })
            .map(title=>({title: <MdPreview>{title}</MdPreview>})).reverse()
    return []
}

export const useBreadcrumbTitleForJump = ()=>{
    const jumpToKnode = useJumpToKnode()
    return (chainStyleData: Knode[]):BreadcrumbItemType[]=>{
        if(!chainStyleData)
            return []
        return chainStyleData.map(data=>({
            title: (
                <div
                    className={utils.icon_button_normal}
                    onClick={()=>jumpToKnode(data.id)}>
                    <MdPreview>{data.title}</MdPreview>
                </div>
            )
        }))
    }
}