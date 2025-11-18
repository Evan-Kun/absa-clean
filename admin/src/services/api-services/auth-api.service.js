import apiHelper, { APIURL } from "../api-helper";

const authServices = () => {
    const { api } = apiHelper();

    const LoginAdmin = async (body) => {
        const url = `${APIURL}auth/login?isAdmin=${true}`;
        const method = "post";

        try {
            const response = await api({ method, url, body });
            if (response?.status == 200) { return { success: true, data: response?.data?.data } }
            return { success: false, data: response?.data?.data };
        } catch (error) {
            console.error("Login error:", error);
            return { success: false };
        }
    };

    const fetchRoles = async () => {
        const url = `${APIURL}auth/roles`;
        const method = "get";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, headers });
            if (response?.status == 200) { return { success: true, data: response?.data?.data } }
            return { success: false, data: response?.data?.data };
        } catch (error) {
            console.error("fetch Roles Error:", error);
            return { success: false };
        }
    };

    const fetchOrganizations = async () => {
        const url = `${APIURL}auth/organizations`;
        const method = "get";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, headers });
            if (response?.status == 200) { return { success: true, data: response?.data?.data } }
            return { success: false, data: response?.data?.data };
        } catch (error) {
            console.error("fetch Roles Error:", error);
            return { success: false };
        }
    };

    return { LoginAdmin, fetchRoles, fetchOrganizations };
}

export default authServices;
