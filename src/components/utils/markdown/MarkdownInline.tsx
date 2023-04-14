import React, {ChangeEvent, useContext, useEffect, useRef} from 'react';
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

    return (
        <div>
            {edit?
                <Input
                    className={props.className}
                    ref={inputRef}
                    value={props.initialText}
                    onChange={props.onTextChange}
                    onKeyPress={({shiftKey, key})=> {
                        if(shiftKey && key === "Enter"){
                            props.onSubmit()
                            setEdit(false)
                            props.possessorRef && props.possessorRef.focus()
                        }
                    }}
                    onBlur={()=>{
                        props.onSubmit()
                        setEdit(false)
                        props.possessorRef && props.possessorRef.focus()
                    }}
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