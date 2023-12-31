import React, {useEffect, useState} from 'react';
import classes from "./GuestSearch.module.css"
import utils from "../../utils.module.css"
import Search from "antd/es/input/Search";
import {Col, Pagination, Row} from "antd";
import {BookOutlined, UserOutlined} from "@ant-design/icons";
import {KnodeResultsAtom, UserResultsAtom, useSearch} from "../Main/InfoRight/SharePanel/SearchPanel/SearchPanelHooks";
import {useRecoilState} from "recoil";
import {UserInfoItem} from "../Main/InfoRight/SharePanel/UserSubscribePanel/UserSubscribePanel";
import KnodeShareCard from "../Main/InfoRight/SharePanel/KnodeShareCard/KnodeShareCard";
import {User} from "../../service/data/Gateway";
import {UserShare} from "../../service/data/share/UserShare";
import {getUserShare} from "../../service/api/ShareApi";

const GuestSearch = () => {
    const [userResults, setUserResults] = useRecoilState(UserResultsAtom)
    const [knodeResults, setKnodeResults] = useRecoilState(KnodeResultsAtom)
    const [searchText, setSearchText] = useState("")
    const [mode, setMode] = useState<"knode" | "user">("user")
    const [userData, setUserData] = useState<{info: User, share: UserShare}[]>([])
    const [userCurrentPage, setUserCurrentPage] = useState(1)
    const [knodeCurrentPage, setKnodeCurrentPage] = useState(1)
    const pageSize = 10
    const search = useSearch()
    useEffect(()=>{
        const effect = async ()=>{
            let userDataTemp = []
            for(let user of userResults)
                userDataTemp.push({info: user, share: await getUserShare(user.id!)})
            setUserData(userDataTemp)
        };effect().then()
    }, [userResults])
    useEffect(()=>{
        mode === "user" && setKnodeResults([])
        mode === "knode" && setUserResults([])
        //eslint-disable-next-line
    }, [mode])
    return (
        <div className={classes.container}>
            <div className={classes.icon}>
                Mind Trace 搜索
            </div>
            <div className={classes.input}>
                <Row>
                    <Col span={4} className={classes.search_mode}>{
                        mode === "knode" &&
                        <BookOutlined
                            className={utils.icon_button}
                            onClick={()=>setMode("user")}/>}{
                        mode === "user" &&
                        <UserOutlined
                            className={utils.icon_button}
                            onClick={()=>setMode("knode")}/>
                    }</Col>
                    <Col span={20}>{
                        <Search
                            className={classes.search_bar} size={"large"}
                            onChange={({target:{value}})=>setSearchText(value)}
                            onSearch={()=>search(searchText, mode)}
                            placeholder={mode === "knode" ? "搜索知识 . . . ": "搜索用户 . . ."}/>
                    }</Col>
                </Row>
            </div>
            <Row className={`${classes.results} ${utils.custom_scrollbar}`}>
                <Col span={24}>{
                    mode === "user" &&
                    <div>{
                        userData
                            .slice((userCurrentPage - 1) * pageSize, userCurrentPage * pageSize)
                            .map((user)=>(<UserInfoItem info={user.info} share={user.share} key={user.info.id}/>))
                    }<Pagination
                        onChange={(page)=>setUserCurrentPage(page)}
                        pageSize={pageSize}
                        hideOnSinglePage={true}
                        total={userData.length}/>
                    </div>
                }{  mode === "knode" &&
                    <div>{
                        knodeResults
                            .slice((knodeCurrentPage - 1) * pageSize, knodeCurrentPage * pageSize)
                            .map((knode)=>(<KnodeShareCard key={knode.id} knodeId={knode.id}/>))
                    }<Pagination
                        onChange={(page)=>setKnodeCurrentPage(page)}
                        pageSize={pageSize}
                        hideOnSinglePage={true}
                        total={knodeResults.length}/>
                    </div>
                }</Col>
            </Row>
        </div>
    );
};

export default GuestSearch;