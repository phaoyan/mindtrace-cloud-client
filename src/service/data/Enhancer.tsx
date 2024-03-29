
export const defaultEnhancer: Enhancer = {
    id:-1,
    title:"",
    introduction:"",
    length:-1,
    createTime:"",
    createBy:-1,
    resources:[],
    labels:[],
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

export interface Label{
    name: string,
    createTime: string,
    createBy: string
}