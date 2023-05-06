import React, {useEffect, useState} from 'react';
import {useRecoilState, useRecoilValue} from "recoil";
import {UserID, UserShareAtom} from "../../../../recoil/User";
import {
    getRelatedKnodeShare,
    getUserShare,
    openUserShare
} from "../../../../service/api/ShareApi";
import classes from "./SharePanel.module.css"
import {MilkdownProvider} from "@milkdown/react";
import {MilkdownEditor} from "../../../utils/markdown/MilkdownEditor";
import {initiative} from "./OpenShareInitiative";
import {SelectedKnodeIdAtom} from "../../../../recoil/home/Knode";
import {KnodeShare} from "../../../../service/data/share/KnodeShare";
import KnodeShareCard from "./KnodeShareCard";

const SharePanel = () => {

    const userId = useRecoilValue(UserID);
    const [userShare, setUserShare] = useRecoilState(UserShareAtom)

    const handleConfirm = async ()=>{
        await openUserShare(userId)
        let share = await getUserShare(userId)
        setUserShare(share)
    }

    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [relatedKodeShares, setRelatedKnodeShares] = useState<KnodeShare[]>([])
    const init = async ()=>{
        setRelatedKnodeShares(await getRelatedKnodeShare(selectedKnodeId, 6))
    }
    // eslint-disable-next-line
    useEffect(()=> {init()},[selectedKnodeId])

    if(!userShare) return (
        <div className={classes.placeholder_container}>
            <MilkdownProvider>
                <MilkdownEditor md={initiative} onChange={()=>{}} editable={false}/>
            </MilkdownProvider>
            <div
                className={classes.confirm}
                onClick={handleConfirm}>
                加入 Mindtrace Share
            </div>
        </div>
    )
    return (
        <div className={classes.container}>
            {relatedKodeShares.map(knodeShare=>(
                <KnodeShareCard knodeShare={knodeShare} key={knodeShare.id}/>
            ))}
        </div>
    );
};

export default SharePanel;