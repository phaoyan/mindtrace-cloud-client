import dayjs from "dayjs";
import axios from "axios";
import {ENHANCER_HOST} from "../../../../../service/api/EnhancerApi";

export const updateImage = async (image: File, resourceId: number)=>{
    const name = dayjs().valueOf().toString()
    const formData = new FormData()
    formData.append("file", image)
    return await axios.post(`${ENHANCER_HOST}/resource/${resourceId}/data/${name}/file`, formData).then(({data})=>data)
}