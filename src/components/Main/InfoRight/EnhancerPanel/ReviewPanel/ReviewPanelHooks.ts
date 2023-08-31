import {atom, useRecoilState} from "recoil";
import {ackReview} from "../../../../../service/api/MasteryApi";

export const ReviewKnodeIdsAtom = atom<number[]>({
    key: "ReviewKnodeIdsAtom",
    default: []
})

export const useAckReview = ()=>{
    const [reviewKnodeIds, setReviewKnodeIds] = useRecoilState(ReviewKnodeIdsAtom)
    return async (knodeId: number, next: number)=>{
        await ackReview(knodeId, next)
        setReviewKnodeIds(reviewKnodeIds.filter(id=>id!==knodeId))
    }
}