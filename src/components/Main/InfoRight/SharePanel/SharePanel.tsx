import React, {useEffect, useState} from 'react';
import {useRecoilState, useRecoilValue} from "recoil";
import {getRelatedKnodeShare} from "../../../../service/api/ShareApi";
import classes from "./SharePanel.module.css"
import KnodeShareCard from "./KnodeShareCard/KnodeShareCard";
import {
    RelatedKnodeIdsAtom,
} from "./SharePanelHooks";
import {Divider, Pagination} from "antd";
import SearchPanel from "./SearchPanel/SearchPanel";
import {SelectedKnodeIdAtom} from "../../../../recoil/home/Knode";

const SharePanel = () => {

    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [relatedKnodeIds, setRelatedKnodeIds] = useRecoilState(RelatedKnodeIdsAtom)
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 5
    useEffect(()=> {
        const init = async ()=>{
            setRelatedKnodeIds((await getRelatedKnodeShare(selectedKnodeId, 0.9)).map(share=>share.knodeId))
        }; init()
        //eslint-disable-next-line
    },[selectedKnodeId])

    return (
        <div className={classes.container}>
            <SearchPanel/>
            <Divider/>{
            relatedKnodeIds
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map(id=>(<KnodeShareCard knodeId={id} key={id}/>))
            }<Pagination
                onChange={(page)=>setCurrentPage(page)}
                defaultCurrent={currentPage}
                pageSize={pageSize}
                hideOnSinglePage={true}
                total={relatedKnodeIds.length}/>
        </div>
    );
};

export default SharePanel;