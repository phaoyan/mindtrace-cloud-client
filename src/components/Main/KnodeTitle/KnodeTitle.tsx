import React, {useEffect, useRef} from 'react';
import {useRecoilState, useRecoilValue} from "recoil";
import classes from "./KnodeTitle.module.css"
import {KnodeSelector, SelectedKnodeIdAtom} from "../../../recoil/home/Knode";
import {Input, InputRef} from "antd";
import MdPreview from "../../utils/markdown/MdPreview";
import {TitleEditKnodeIdAtom, useHandleSubmit} from "./KnodeTitleHooks";


const KnodeTitle = (props: { id: number}) => {

    const [knode, setKnode] = useRecoilState(KnodeSelector(props.id))
    const [titleEditKnodeId, setTitleEditKnodeId] = useRecoilState(TitleEditKnodeIdAtom)
    const selectedId = useRecoilValue(SelectedKnodeIdAtom)
    const divRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<InputRef>(null)
    const handleSubmit = useHandleSubmit()
    useEffect(()=>{
    },[knode])
    useEffect(()=>{
        if(titleEditKnodeId)
            inputRef.current?.focus()
    }, [titleEditKnodeId])
    useEffect(()=>{
        if(selectedId === props.id)
            divRef.current?.focus()
    }, [props.id, selectedId])

    if(!knode) return <></>
    return (
        <div className={classes.container}>
            <div tabIndex={0} ref={divRef}>
                {
                    titleEditKnodeId === knode.id?
                    <Input
                        className={classes.title}
                        ref={inputRef}
                        value={knode.title}
                        onChange={({target: {value}})=> setKnode({...knode, title: value})}
                        onKeyPress={({shiftKey, key})=>shiftKey && key === "Enter" && handleSubmit()}
                        onBlur={()=>handleSubmit()}
                        bordered={false}/>:
                    <div
                        className={classes.title}
                        onDoubleClick={()=>setTitleEditKnodeId(knode?.id)}>
                        <MdPreview>{knode.title}</MdPreview>
                    </div>
                }
            </div>
        </div>
    );
};

export default KnodeTitle;