import apiHelper, { APIURL } from "../api-helper";

const masterSerive = () => {
    const { api } = apiHelper();

    const fetchAllSkills = async () => {
        const url = `${APIURL}master/list/skills?viewCount=true`;
        const method = "get";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, headers });
            if (response?.status == 200) { return { success: true, data: response?.data?.data } }
            return { success: false, data: response?.data?.data };
        } catch (error) {
            console.error("Fetch all count error:", error);
            return { success: false };
        }
    };

    const bulkUpdateSkills = async (body) => {
        const url = `${APIURL}master/bulkupdate/skills`;
        const method = "put";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, headers, body });
            if (response?.status == 200) { return { success: true, data: response?.data?.data } }
            return { success: false, data: response?.data?.data };
        } catch (error) {
            console.error("Fetch all bulkUpdateSkills:", error);
            return { success: false };
        }
    };
    return { fetchAllSkills, bulkUpdateSkills };

}

export default masterSerive;
