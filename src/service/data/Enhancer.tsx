
export const defaultEnhancer: Enhancer = {
    id:-1,
    title:"",
    introduction:"",
    length:-1,
    createTime:"",
    createBy:-1,
    isQuiz: false
}
export interface Enhancer{
    id:number,
    title:string,
    introduction:string,
    length:number,
    createTime:string,
    createBy:number,
    isQuiz: boolean
}