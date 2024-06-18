import ClipboardJS from 'clipboard';


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
    return decoder.decode(byteArray);
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


export const generateUUID = ()=>{
    let d = new Date().getTime(); // 时间戳
    let d2 = (performance && performance.now && performance.now() * 1000) || 0; //高精度时间戳

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random() * 16; // 随机数
        if (d > 0) {
            // 使用时间戳
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {
            // 使用高精度时间戳
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        // 替换 'x' 为随机数，'y' 为随机数且高4比特位为 8, 9, A, 或 B
        //eslint-disable-next-line
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}


export const copyToClipboard = (txt: string) => {
    // Create a temporary button element
    const button = document.createElement('button');
    button.id = "clipboardjs"
    button.style.position = 'absolute';
    button.style.left = '-9999em';
    button.setAttribute('data-clipboard-text', txt);
    const clipboard = new ClipboardJS('#clipboardjs');
    clipboard.on('success', function(e) {
        console.log('文本已复制:', e.text);
        e.clearSelection();
    });
    clipboard.on('error', function(e) {
        console.error('复制失败', e);
    });
    // Append button to the body
    document.body.appendChild(button);
    // Programmatically trigger the click event to copy the text
    button.click();
    // Clean up
    document.body.removeChild(button);
};