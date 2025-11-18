import apiHelper, { APIURL } from "../api-helper";

const pageServices = () => {
    const { api } = apiHelper();

    const fetchPage = async (pageName: string = ''): Promise<any> => {
        let url = `${APIURL}pages/${pageName}`;
        const method = "get";

        try {
            const response = await api({ method, url });
            if (response?.status == 200) { return { success: true, data: response?.data?.data, message: response?.data?.message } }
            return { success: false, message: response?.data?.message || 'An error occurred', data: response?.data };
        } catch (error: any) {
            console.error("Error fetch page :", error);
            return { success: false, message: error?.message || 'An error occurred' };
        }
    };

    return { fetchPage };
}

export default pageServices;