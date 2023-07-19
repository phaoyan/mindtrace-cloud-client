import React, {useEffect} from 'react';
import {useRecoilState, useRecoilValue} from "recoil";
import {
    getRelatedKnodeShare,
    getUserShare,
    openUserShare
} from "../../../../service/api/ShareApi";
import classes from "./SharePanel.module.css"
import {MilkdownProvider} from "@milkdown/react";
import {MilkdownEditor} from "../../../utils/markdown/MilkdownEditor";
import {initiative} from "./OpenShareInitiative";
import {DelayedSelectedKnodeIdAtom} from "../../../../recoil/home/Knode";
import KnodeShareCard from "./KnodeShareCard/KnodeShareCard";
import {
    RelatedKnodeIdsAtom,
    UserShareAtom
} from "./SharePanelHooks";
import {LoginUserIdSelector} from "../../../Login/LoginHooks";

const SharePanel = () => {

    const userId = useRecoilValue(LoginUserIdSelector);
    const [userShare, setUserShare] = useRecoilState(UserShareAtom)
    const selectedKnodeId = useRecoilValue(DelayedSelectedKnodeIdAtom)
    const [relatedKnodeIds, setRelatedKnodeIds] = useRecoilState(RelatedKnodeIdsAtom)
    useEffect(()=> {
        const init = async ()=>{
            setRelatedKnodeIds((await getRelatedKnodeShare(selectedKnodeId)).map(share=>share.knodeId))
        }; init()
        //eslint-disable-next-line
    },[selectedKnodeId])

    if(!userShare) return (
        <div className={classes.placeholder_container}>
            <MilkdownProvider>
                <MilkdownEditor md={initiative} onChange={()=>{}} editable={false}/>
            </MilkdownProvider>
            <div
                className={classes.confirm}
                onClick={async ()=>{
                    await openUserShare(userId)
                    let share = await getUserShare(userId)
                    setUserShare(share)}}>
                加入 Mindtrace Share
            </div>
        </div>
    )
    return (
        <div className={classes.container}>{
            [...new Set(relatedKnodeIds)].map(id=>(<KnodeShareCard knodeId={id} key={id}/>))
        }</div>
    );
};

export default SharePanel;