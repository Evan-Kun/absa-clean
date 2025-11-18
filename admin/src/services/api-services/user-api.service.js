import apiHelper, { APIURL } from "../api-helper";

const userService = () => {
    const { api } = apiHelper();

    const createUser = async (body) => {
        const url = `${APIURL}user/create`;
        const method = "post";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, body, headers });
            if (response?.status == 200) { return { success: true, data: response?.data?.data } }
            return { success: false, data: response?.data?.data };
        } catch (error) {
            console.error("Create User error:", error);
            return { success: false };
        }
    };

    const updateUser = async (body) => {
        const url = `${APIURL}user/update`;
        const method = "put";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, body, headers });
            if (response?.status == 200) { return { success: true, data: response?.data?.data } }
            return { success: false, data: response?.data?.data };
        } catch (error) {
            console.error("Create User error:", error);
            return { success: false };
        }
    };

    const changePassword = async (body) => {
        const url = `${APIURL}user/changePassword`;
        const method = "put";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, body, headers });
            if (response?.status == 200) { return { success: true, data: response?.data?.data } }
            return { success: false, data: response?.data?.data };
        }
        catch (error) {
            console.error("Change Password error:", error);
            return { success: false }
        }
    }

    const listAllUsers = async (page, limit, search) => {
        let url = `${APIURL}user/list`;
        if (page && limit) { url += `?page=${page}&limit=${limit}` }
        if (search) { url += `&search=${search}` }
        const method = "get";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, headers });
            if (response?.status == 200) { return { success: true, data: response?.data?.data, pagination: response?.data?.pagination } }
            return { success: false, data: response?.data?.data };
        } catch (error) {
            console.error("List User error:", error);
            return { success: false };
        }
    };


    const deleteUser = async (userId) => {
        let url = `${APIURL}user/delete/${userId}`;
        const method = "delete";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, headers });
            if (response?.status == 200) { return { success: true, data: response?.data } }
            return { success: false, data: response?.data?.data };
        } catch (error) {
            console.error("Delete User error:", error);
            return { success: false };
        }
    }

    return { createUser, listAllUsers, updateUser, changePassword, deleteUser };
}

export default userService;
