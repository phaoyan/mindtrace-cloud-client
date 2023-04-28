export const insertStringAt = (originalString:string, insertString:string, index:number): string=> {
    if (index < 0 || index > originalString.length) {
        return originalString;
    }
    return originalString.slice(0, index) + insertString + originalString.slice(index);
}

export const base64ToArrayBuffer = (base64: string) => {
    if(!base64 || base64 === "") return []
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}
