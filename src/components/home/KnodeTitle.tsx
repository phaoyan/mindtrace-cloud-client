import React from 'react';
import {useRecoilState, useRecoilValue} from "recoil";
import {UserID} from "../../recoil/User";
import {updateKnode} from "../../service/api/KnodeApi";
import classes from "./KnodeTitle.module.css"
import MarkdownInline from "../utils/markdown/MarkdownInline";
import {KnodeSelector} from "../../recoil/home/Knode";

const KnodeTitle = (props: { id: number, possessorRef: HTMLDivElement}) => {

    const userId = useRecoilValue(UserID);
    const [knode, setKnode] = useRecoilState(KnodeSelector(props.id))

    if(!knode) return <></>
    return (
        <div>
            <div>
                <MarkdownInline
                    possessorRef={props.possessorRef}
                    editKey={props.id}
                    className={classes.display}
                    initialText={knode.title}
                    // @ts-ignore
                    onTextChange={({target: {value}})=>setKnode({...knode, title: value})}
                    onSubmit={()=>updateKnode(knode, userId)}/>
            </div>
        </div>
    );
};

export default KnodeTitle;