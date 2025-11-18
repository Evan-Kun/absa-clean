import apiHelper, { APIURL } from "../api-helper";

const pageService = () => {
    const { api } = apiHelper();

    const createOrUpdatePage = async (body) => {
        const url = `${APIURL}pages/create`;
        const method = "post";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, body, headers });
            if (response?.status == 200) { return { success: true, data: response?.data?.data } }
            return { success: false, data: response?.data?.data };
        } catch (error) {
            console.error("Create or Update Page error:", error);
            return { success: false };
        }
    };

    const fetchPages = async (page, limit, pageName) => {
        let url = `${APIURL}pages/${pageName}`;
        if (page && limit) {url += `?page=${page}&limit=${limit}`}
        const method = "get";

        try {
            const response = await api({ method, url });
            if (response?.status == 200) { return { success: true, data: response?.data?.data, pagination: response?.data?.pagination } }
            return { success: false, data: response?.data?.data };
        } catch (error) {
            console.error("Fetch Page Details error:", error);
            return { success: false };
        }
    };

    const deletePage = async (id) => {
        let url = `${APIURL}pages/delete/${id}`;
        const method = "delete";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, headers });
            if (response?.status == 200) { return { success: true, data: response?.data?.data } }
            return { success: false, data: response?.data?.data };
        } catch (error) {
            console.error("Delete Page error:", error);
            return { success: false };
        }
    }

    return { createOrUpdatePage, fetchPages, deletePage }
}

export default pageService;