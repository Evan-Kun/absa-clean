import apiHelper, { APIURL } from "../api-helper";

const fileUploadServices = () => {
    const { api } = apiHelper();

    const upload = async (body: any, filename: string = '', type = 'common',): Promise<any> => {
        let url = `${APIURL}file/upload/${type}`;
        if (filename) { url += `?filename=${filename}` }
        const method = "post";

        try {
            const token = localStorage.getItem('token');
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            };

            const response = await api({ method, url, body, headers });
            if (response?.status == 200) { return { success: true, file: response?.data?.data?.file } }
            return { success: false, data: response?.data?.data };
        } catch (error) {
            console.error("File Upload error:", error);
            return { success: false };
        }
    };

    return { upload };
}

export default fileUploadServices;
