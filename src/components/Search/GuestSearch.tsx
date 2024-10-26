import React, {useEffect, useRef, useState} from 'react';
import classes from "./GuestSearch.module.css"
import utils from "../../utils.module.css"
import SearchPanel from "../Main/InfoRight/SearchPanel/SearchPanel";

const GuestSearch = () => {

    const mainRef = useRef<HTMLDivElement>(null)
    const [mainPageHeight, setMainPageHeight] = useState(document.body.scrollWidth * 0.9)
    useEffect(()=>{
        if(mainRef.current)
            setMainPageHeight(mainRef.current.scrollHeight)
    }, [])

    return (
        <div className={classes.container} ref={mainRef} style={{height:mainPageHeight}}>
            <div
                className={`${classes.main} ${utils.custom_scrollbar}`}>
                <div className={classes.icon}>
                    Mind Trace 搜索
                </div>
                <br/>
                <div className={classes.search}>
                    <SearchPanel/>
                </div>
            </div>
            <div className={classes.ipc_info}>
                <a href="https://beian.miit.gov.cn/" target="_blank" rel={"noreferrer"} style={{color: "grey"}}>ICP备案号：</a>
                <a href="https://beian.miit.gov.cn/" target="_blank" rel={"noreferrer"} style={{color: "grey"}}>赣ICP备2024020351号-1</a>
            </div>
        </div>
    );
};

export default GuestSearch;