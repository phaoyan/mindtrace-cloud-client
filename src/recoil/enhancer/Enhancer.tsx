import {atom} from "recoil";

export interface Enhancer{
    id:number,
    title:string,
    introduction:string,
    length:number,
    createTime:string,
    createBy:number,
    privacy:boolean,
    resources:Array<{
        id:number,
        title:string,
        type:string,
        createTime:string,
        createBy:number,
        privacy:string
    }>,
    labels:Array<{
        name:string,
        createTime:string,
        createBy:string
    }>
}
export const EnhancerRepository = atom<Array<Enhancer>>({
    key:"EnhancerRepository",
    default:[]
})