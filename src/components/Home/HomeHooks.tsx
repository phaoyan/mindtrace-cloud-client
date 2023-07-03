import {RcFile} from "antd/es/upload";
import {atom, useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {MessageApiAtom} from "../../recoil/utils/DocumentData";
import {LoginUserAtom} from "../Login/LoginHooks";
import {changePassword, getUserPublicInfo} from "../../service/api/LoginApi";


export const ChangePasswordModalAtom = atom<boolean>({
    key: "ChangePasswordModalAtom",
    default: false
})
export const useAvatarCheck = ()=>{
    const message = useRecoilValue(MessageApiAtom)
    return (file:RcFile)=>{
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng)
            message.error('仅支持 JPG / PNG 格式的图片');
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M)
            message.error('图片大小需小于 2MB');
        return isJpgOrPng && isLt2M;
    }
}

export const useCheckUserInfo = ()=>{
    const [user, setUser] = useRecoilState(LoginUserAtom)

    return async ()=>{
        if(!user) return
        const info = await getUserPublicInfo(user.id!)
        setUser({...user, avatar: info.avatar})
    }
}

export const useChangePassword = ()=>{
    const user = useRecoilValue(LoginUserAtom)
    const setChangePasswordModal = useSetRecoilState(ChangePasswordModalAtom)
    const messageApi = useRecoilValue(MessageApiAtom)

    return async (oriPassword: string, newPassword: string, confirmPassword: string)=>{
        if(!user) return
        if(newPassword !== confirmPassword) return
        const resp = await changePassword(user.id!, oriPassword, newPassword);
        if(resp.code === 200){
            messageApi.success("密码修改成功!")
            setChangePasswordModal(false)
        } else messageApi.error(resp.msg)
    }
}