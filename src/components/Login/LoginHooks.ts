import {login, register} from "../../service/api/LoginApi";
import {atom, useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {User} from "../../recoil/User";
import {CurrentPageAtom, MessageApiAtom} from "../../recoil/utils/DocumentData";
import {RESULT} from "../../constants";


export const LoginErrorAtom = atom<string | undefined>({
    key:"LoginError",
    default: undefined
})
export const useLogin = ()=>{
    const [user, setUser] = useRecoilState(User)
    const setError = useSetRecoilState(LoginErrorAtom)
    const setCurrentPage = useSetRecoilState(CurrentPageAtom)
    return async ()=>{
        const saResult = await login(user.username, user.password);
        if(saResult.code === 200){
            setUser({...user, id: saResult.data})
            setCurrentPage("/main")
        }else setError(saResult.msg)
    }
}

export const useRegister = ()=>{
    const user = useRecoilValue(User)
    const messageApi = useRecoilValue(MessageApiAtom)
    return async ()=>{
        const saResult = await register(user.username, user.password);
        if(saResult.code === RESULT.OK)
            messageApi.success("注册成功！")
        else messageApi.error("注册失败：" + saResult.msg)
    }
}