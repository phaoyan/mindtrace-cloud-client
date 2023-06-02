import React, {ChangeEvent, useContext, useEffect, useRef, useState} from 'react';
import {Input, InputRef} from "antd";
import MdPreview from "./MdPreview";
import {useRecoilState} from "recoil";
import {
    MarkdownEditSelector,
    MarkdownInlineContext
} from "../../../recoil/utils/MarkdownInline";

const MarkdownInline = (props:{
    editKey: number,
    className?: string,
    initialText: string,
    onTextChange: (event: ChangeEvent)=>any,
    onSubmit: ()=>any,
    possessorRef: HTMLDivElement //用于实现submit后焦点还给引用组件
}) => {

    const inputRef = useRef<InputRef>(null)
    const [edit, setEdit] = useRecoilState(MarkdownEditSelector(props.editKey))

    useEffect(()=>{
        if(edit)
            inputRef.current &&
            inputRef.current.focus()
        else
            inputRef.current &&
            inputRef.current.blur()
    },[edit])

    // 实现父组件选中这个markdownInline（即父组件把editContent设为这个markdownInline的editKey）
    // 后，这个组件响应变化并转为Edit模式
    const editContext = useContext(MarkdownInlineContext)
    useEffect(()=>{
        if(editContext === props.editKey)
            setEdit(true)
    // eslint-disable-next-line
    },[editContext])


    // onSubmit的shift+enter和onBlur有时会同时触发，设置一个最小间隔避免这个情况
    const [ephemeral, setEphemeral] = useState(false)
    useEffect(()=>{
        if(ephemeral){
            setTimeout(()=>{
                setEphemeral(false)
            }, 2000)
            props.onSubmit()
            setEdit(false)
            props.possessorRef && props.possessorRef.focus()
        }
        //eslint-disable-next-line
    },[ephemeral])


    return (
        <div>
            {edit?
                <Input
                    className={props.className}
                    ref={inputRef}
                    value={props.initialText}
                    onChange={props.onTextChange}
                    onKeyPress={({shiftKey, key})=> {
                        if(shiftKey && key === "Enter")
                            setEphemeral(true)
                    }}
                    onBlur={()=>setEphemeral(true)}
                    bordered={false}/>:
                <div
                    className={props.className}
                    onDoubleClick={()=>setEdit(true)}>
                    <MdPreview>{props.initialText}</MdPreview>
                </div>
            }
        </div>
    );
};

export default MarkdownInline;