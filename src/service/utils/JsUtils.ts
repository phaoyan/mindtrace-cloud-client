export const insertStringAt = (originalString:string, insertString:string, index:number): string=> {
    if (index < 0 || index > originalString.length) {
        return originalString;
    }
    return originalString.slice(0, index) + insertString + originalString.slice(index);
}