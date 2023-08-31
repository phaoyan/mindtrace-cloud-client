import React, {useEffect, useState} from 'react';
import {Col, Input, Pagination, Radio, Row} from "antd";
import {KnodeResultsAtom, UserResultsAtom, useSearch} from "./SearchPanelHooks";
import {SearchOutlined} from "@ant-design/icons";
import classes from "./SearchPanel.module.css";
import {useRecoilState} from "recoil";
import {User} from "../../../../../service/data/Gateway";
import {UserShare} from "../../../../../service/data/share/UserShare";
import {getUserShare} from "../../../../../service/api/ShareApi";
import {UserInfoItem} from "../UserSubscribePanel/UserSubscribePanel";
import KnodeShareCard from "../KnodeShareCard/KnodeShareCard";
import utils from "../../../../../utils.module.css"

const SearchPanel = () => {
    const [userResults, setUserResults] = useRecoilState(UserResultsAtom)
    const [knodeResults, setKnodeResults] = useRecoilState(KnodeResultsAtom)
    const [searchText, setSearchText] = useState("")
    const [userData, setUserData] = useState<{info: User, share: UserShare}[]>([])
    const [userCurrentPage, setUserCurrentPage] = useState(1)
    const [knodeCurrentPage, setKnodeCurrentPage] = useState(1)
    const pageSize = 10
    const [mode, setMode] = useState<"user" | "knode">("user")
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
        <div>
            <Row>
                <Col span={15} className={classes.search}>
                    <SearchOutlined
                        className={`${classes.search_icon} ${utils.icon_button}`}
                        onClick={()=>search(searchText, mode)}/>
                    <Input
                        bordered={false}
                        placeholder={"搜索. . ."}
                        onChange={({target:{value}})=>setSearchText(value)}
                        onBlur={()=>search(searchText, mode)}/>
                </Col>
                <Col span={9}>
                    <Radio.Group onChange={({target:{value}})=>setMode(value)} value={mode}>
                        <Radio value={"user"}>
                            <span className={classes.option}>用户</span>
                        </Radio>
                        <Radio value={"knode"}>
                            <span className={classes.option}>知识</span>
                        </Radio>
                    </Radio.Group>
                </Col>
            </Row>
            <Row>
                <Col span={22} offset={1}>{
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

export default SearchPanel;