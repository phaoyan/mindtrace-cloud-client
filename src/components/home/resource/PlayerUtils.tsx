import {addDataToResource, getAllDataFromResource} from "../../../service/api/ResourceApi";
import {SetStateAction} from "react";

export const submit = (userId: number, resourceId: number, data: any) => {
    addDataToResource(userId, resourceId, data)
}

export const loadData = (userId: number, resourceId: number, setData: SetStateAction<any>, setLoading:SetStateAction<any>)=>{
    getAllDataFromResource(userId, resourceId)
        .then((data) => {
            setData(data)
            setLoading(false)
            // console.log(data)
        })
}