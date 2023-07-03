import {getLoginData, login, registerConfirm, sendValidateCode} from "../../service/api/LoginApi";
import {atom, selector, useRecoilValue, useSetRecoilState} from "recoil";
import {CurrentPageAtom, MessageApiAtom} from "../../recoil/utils/DocumentData";
import {User} from "../../service/data/Gateway";


export const LoginUserAtom = atom<User | undefined>({
    key: "LoginUserAtom",
    default: undefined
})
export const LoginUserIdSelector = selector<number>({
    key:"LoginUserIdSelector",
    get: ({get})=>{
        const loginUser = get(LoginUserAtom);
        return loginUser ? loginUser.id! : -1
    }
})
export const RegisterModalOpenAtom = atom<boolean>({
    key: "RegisterModalOpenAtom",
    default: false
})

export const IsLogin = selector<boolean>({
    key: "IsLogin",
    get: ({get})=>get(LoginUserIdSelector) !== -1
})
export const LoginErrorAtom = atom<string | undefined>({
    key:"LoginError",
    default: undefined
})
export const useLogin = ()=>{
    const setUser = useSetRecoilState(LoginUserAtom)
    const setError = useSetRecoilState(LoginErrorAtom)
    const setCurrentPage = useSetRecoilState(CurrentPageAtom)
    return async (username: string, password: string)=>{
        const saResult = await login(username, password);
        if(saResult.code === 200){
            setUser(await getLoginData())
            setCurrentPage("/main")
        }else setError(saResult.msg)
    }
}

export const useRegisterSendValidateCode = ()=>{
    const messageApi = useRecoilValue(MessageApiAtom)
    return async (email: string)=>{
        const resp = await sendValidateCode(email);
        if(resp.code !== 200)
            messageApi.error(resp.msg)
        else messageApi.success("验证码已发送，请前往邮箱查看")
    }
}

export const useRegisterConfirm = ()=>{
    const setRegisterModalOpen = useSetRecoilState(RegisterModalOpenAtom)
    const messageApi = useRecoilValue(MessageApiAtom)
    return async (username: string, password: string, rePassword: string, email: string, code: number)=>{
        if(password !== rePassword)
            messageApi.error("重复密码错误")
        const resp = await registerConfirm(username, password, email, code);
        if(resp.code !== 200)
            messageApi.error(resp.msg)
        else {
            messageApi.success("注册成功！")
            setRegisterModalOpen(false)
        }
    }
}