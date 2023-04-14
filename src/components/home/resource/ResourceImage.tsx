import React, {useEffect, useState} from 'react';
import {getDataFromResourceByUrl} from "../../../service/api/ResourceApi";
import {Image} from "antd";

/**
 * 后台resource返回的数据是json格式，从json格式中拿到图片base64数据才能显示。
 * 本组件往传入的url发送get请求得到resource数据后找到base64字符串放入img的src中实现图片显示
 */
const ResourceImage = (props:{ src: string}) => {

    const [base64, setBase64] = useState<string>()

    useEffect(()=>{
        getDataFromResourceByUrl(props.src).then((data)=>setBase64(data))
    },[props.src])
    console.log("src", props.src)
    return (
        <Image src={base64} alt={""}/>
    );
};

export default ResourceImage;