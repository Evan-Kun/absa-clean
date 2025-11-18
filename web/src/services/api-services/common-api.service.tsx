import apiHelper, { APIURL } from "../api-helper";

const commonApiServices = () => {
    const { api } = apiHelper();

    const fetchAllSkills = async (): Promise<any> => {
        const url = `${APIURL}master/list/skills`;
        const method = "get";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, headers });
            if (response?.status == 200) { return { success: true, ...response?.data } }
        } catch (error) {
            console.error("Error fetchAllSkills :", error);
            return { success: false, message: 'An error occurred' };
        }
    };

    const saveSkill = async (body:any): Promise<any> => {
        const url = `${APIURL}master/create/skills`;
        const method = "put";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, headers,body });
            if (response?.status == 200) { return { success: true, ...response?.data } }
        } catch (error) {
            console.error("Error saveSkill :", error);
            return { success: false, message: 'An error occurred' };
        }
    };

    const fetchSettings = async (): Promise<any> => {
        const url = `${APIURL}common/settings`;
        const method = "get";
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const response = await api({ method, url, headers });
            if (response?.status == 200) { return { success: true, ...response?.data } }
        } catch (error) {
            console.error("Error fetchSettings :", error);
            return { success: false, message: 'An error occurred' };
        }
    };

    return {
        fetchAllSkills,
        saveSkill,
        fetchSettings
    };
}

export default commonApiServices;
