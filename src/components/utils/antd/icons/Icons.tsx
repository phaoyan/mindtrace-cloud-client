import React from 'react';
import Icon from "@ant-design/icons";
import {ReactComponent as LatexSvg} from "./latex.svg";
import {ReactComponent as LatexLightSvg} from "./latex_light.svg"
import {ReactComponent as LatexDarkSvg} from "./latex_dark.svg"
import {ReactComponent as BilibiliTVSvg} from "./bilibili.svg"
import {ReactComponent as ChatGPTSvg} from "./chat_gpt.svg"
import {ReactComponent as FireFilledSvg} from ".//fire_fill.svg"

export const LatexFormulaOutlined = (props:any) => {
    return <Icon component={LatexSvg} {...props}/>;
};

export const LatexLightOutlined = (props:any)=>{
    return <Icon component={LatexLightSvg} {...props}/>
}

export const LatexDarkOutlined = (props:any)=>{
    return <Icon component={LatexDarkSvg} {...props}/>
}

export const BilibiliTVOutlined = (props:any)=>{
    return <Icon component={BilibiliTVSvg} {...props}/>
}

export const ChatGPTOutlined = (props: any)=>{
    return <Icon component={ChatGPTSvg} {...props}/>
}

export const FireFilled = (props: any)=>{
    return <Icon component={FireFilledSvg} {...props}/>
}