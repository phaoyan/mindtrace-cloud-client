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

export const base64DecodeUtf8 =  (base64String: string): string=> {
    // 使用atob()函数将Base64字符串解码为ISO-8859-1格式的字符串
    const decodedIsoString = atob(base64String);

    // 将ISO-8859-1格式的字符串转换为字节数组
    const byteArray = new Uint8Array(decodedIsoString.split('').map(char => char.charCodeAt(0)));

    // 使用TextDecoder将字节数组转换为UTF-8格式的字符串
    const decoder = new TextDecoder('utf-8');
    const decodedUtf8String = decoder.decode(byteArray);

    return decodedUtf8String;
}


export const gradientColor = (begin: string, end: string, count: number): string[] => {
    // check the input validity
    const colorRegex: RegExp = /^#[0-9a-fA-F]{6}$/;
    if (!colorRegex.test(begin) || !colorRegex.test(end)) {
        throw new Error("Invalid color format");
    }
    if (count <= 0) {
        return [];
    }
    // convert color strings to RGB values
    const hexToRgb = (hex: string): number[] => {
        const r: number = parseInt(hex.slice(1, 3), 16);
        const g: number = parseInt(hex.slice(3, 5), 16);
        const b: number = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
    };
    const beginRgb: number[] = hexToRgb(begin);
    const endRgb: number[] = hexToRgb(end);
    // calculate the step size for each segment
    const stepSize: number[] = beginRgb.map((v, i) => (endRgb[i] - v) / count);
    // generate the color array
    const colorArray: string[] = [];
    for (let i = 0; i < count; i++) {
        // calculate the RGB value for each segment
        const segmentRgb: number[] = beginRgb.map((v, j) => v + stepSize[j] * i);
        // convert the RGB value to color string
        const rgbToHex = (rgb: number): string => {
            const hex: string = rgb.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        };
        const segmentHex: string = "#" + segmentRgb.map(rgbToHex).join("");
        // push the color string to the array
        colorArray.push(segmentHex);
    }
    return colorArray;
};


export const statisticDisplayAbbr = (num: number)=>{
    return num < 0 ? 0 : num
}