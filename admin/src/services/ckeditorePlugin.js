import { APIURL, IMAGEPATH } from "./api-helper";

export function customUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new uploadAdapter(loader);
    };
}

class uploadAdapter {
    constructor(loader) {
        this.loader = loader;
    }

    async upload() {
        const data = new FormData();
        const file = await this.loader.file;
        data.append('file', file);

        const token = localStorage.getItem('token');

        let API = `${APIURL}file/upload/ckeditor`;
        if (file?.name) {
            API += `?filename=${file?.name}&resize=false`
        }
        return fetch(API, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: data
        })
            .then((res) => res.json())
            .then((res) => {
                console.log("ssss", `${IMAGEPATH}${res?.data?.file}`);

                return {
                    default: `${IMAGEPATH}${res?.data?.file}`
                };
            })
            .catch((err) => {
                console.error('Upload failed:', err);
            });
    }
    abort() {
    }
}
