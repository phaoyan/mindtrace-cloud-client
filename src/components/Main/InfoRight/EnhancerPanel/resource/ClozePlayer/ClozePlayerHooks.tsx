export const useSegment = ()=>{
    return (raw: string)=>{
        const reg = /\{\{::.*?::\}\}/g
        const plainTxtList = raw.split(reg)
        const clozeList = raw.match(reg) || []
        const res = []
        for (let i = 0; i < plainTxtList.length + clozeList.length; i ++)
            res.push(i % 2 === 0 ? plainTxtList[Math.floor(i/2)] : clozeList[Math.floor(i/2)])
        return res
    }
}

export const useDisplayTxt = ()=>{
    return (segments: string[], index: number)=>{
        let res = ""
        for(let i = 0; i < segments.length; i ++){
            if(i % 2 === 0)
                res += segments[i]
            else if(Math.floor(i/2) === index)
                res += segments[i].slice(4, -4)
            else res += " --?-- "
        }
        return res
    }
}