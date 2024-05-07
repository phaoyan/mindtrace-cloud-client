import dayjs from "dayjs";
import axios from "axios";
import {ENHANCER_HOST} from "../../../../../service/api/EnhancerApi";

export const updateImage = async (image: File, resourceId: number)=>{
    if(image.type === "image/png")
        image = await convertImageToJPEG(image)
    const name = dayjs().valueOf().toString()
    const formData = new FormData()
    formData.append("file", image)
    return await axios.post(`${ENHANCER_HOST}/resource/${resourceId}/data/${name}/file`, formData).then(({data})=>data)
}

const convertImageToJPEG = (imageFile: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = (event: ProgressEvent<FileReader>) => {
            if (event.target && typeof event.target.result === 'string') {
                const imgElement = new Image();
                imgElement.src = event.target.result;
                imgElement.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Failed to get canvas context'));
                        return;
                    }
                    canvas.width = imgElement.width;
                    canvas.height = imgElement.height;
                    ctx.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(new File([blob], 'converted.jpg', { type: 'image/jpeg' }));
                        } else {
                            reject(new Error('Canvas to Blob conversion failed'));
                        }
                    }, 'image/jpeg');
                };
                imgElement.onerror = (error) => {
                    reject(error);
                };
            } else {
                reject(new Error('Reader onload event did not return a string'));
            }
        };
        reader.onerror = (error) => {
            reject(error);
        };
    });
};