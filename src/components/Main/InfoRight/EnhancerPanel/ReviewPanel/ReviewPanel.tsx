import React, {useEffect, useState} from 'react';
import {getQuiz, getReviewKnodeIds} from "../../../../../service/api/MasteryApi";
import {useRecoilState, useRecoilValue} from "recoil";
import {LoginUserIdSelector} from "../../../../Login/LoginHooks";
import {CurrentUserIdSelector} from "../../../Main/MainHooks";
import {SelectedKnodeIdAtom} from "../../../../../recoil/home/Knode";
import {Breadcrumb, Col, Row} from "antd";
import {getChainStyleTitle} from "../../../../../service/api/KnodeApi";
import {breadcrumbTitle} from "../../../../../service/data/Knode";
import {Resource, ResourcePlayer} from "../EnhancerCard/EnhancerCardHooks";
import {getResourceById} from "../../../../../service/api/ResourceApi";
import classes from "./ReviewPanel.module.css"
import {ReviewKnodeIdsAtom, useAckReview} from "./ReviewPanelHooks";

const ReviewPanel = () => {
    const loginId = useRecoilValue(LoginUserIdSelector)
    const currentId = useRecoilValue(CurrentUserIdSelector)
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [reviewKnodeIds, setReviewKnodeIds] = useRecoilState(ReviewKnodeIdsAtom)
    useEffect(()=>{
        if(loginId !== currentId) return
        const effect = async ()=>{
            setReviewKnodeIds(await getReviewKnodeIds(selectedKnodeId))
        }; effect().then()
        // eslint-disable-next-line
    }, [selectedKnodeId])
    return (
        <div>
            {reviewKnodeIds.map(knodeId=><KnodeReview key={knodeId} knodeId={knodeId}/>)}
        </div>
    );
};

export const KnodeReview = (props:{knodeId: number})=>{

    const [chainStyleTitle, setChainStyleTitle] = useState<string[]>([])
    const [quizList, setQuizList] = useState<Resource[]>([])
    const ackReview = useAckReview()

    useEffect(()=>{
        const effect = async ()=>{
            setChainStyleTitle(await getChainStyleTitle(props.knodeId))
            const quizIds = await getQuiz(props.knodeId)
            let temp = []
            for(let quizId of quizIds)
                temp.push(await getResourceById(quizId))
            setQuizList(temp)
        }; effect().then()
    }, [props.knodeId])

    return (
        <div>
            <Row>
                <Col span={24}>
                    <Breadcrumb items={breadcrumbTitle(chainStyleTitle, true)}/>
                </Col>
            </Row>
            <Row>
                <Col span={24}>{
                    quizList.map(quiz=><ResourcePlayer key={quiz.id} resource={quiz}/>)
                }</Col>
            </Row>
            <Row>
                <Col span={20} offset={2} className={classes.next}>
                    <span onClick={()=>ackReview(props.knodeId, 1)}>1 天</span>
                    <span onClick={()=>ackReview(props.knodeId, 3)}>3 天</span>
                    <span onClick={()=>ackReview(props.knodeId, 7)}>1 周</span>
                    <span onClick={()=>ackReview(props.knodeId, 14)}>2 周</span>
                    <span onClick={()=>ackReview(props.knodeId, 28)}>1 月</span>
                    <span onClick={()=>ackReview(props.knodeId, 84)}>3 月</span>
                    <span onClick={()=>ackReview(props.knodeId, -1)}>毕业</span>
                </Col>

            </Row>
        </div>
    );
}

export default ReviewPanel;