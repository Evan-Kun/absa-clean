import apiHelper, { APIURL } from "../api-helper";

const profileService = () => { 
    const { api } = apiHelper();

    const fetchUserProfile = async (page, limit,search) => {
        let url = `${APIURL}profile/list`;
        if (page && limit) { url += `?page=${page}&limit=${limit}` }
        if (search) { url += `&search=${search}`}
        const method = "get";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, headers });
            if (response?.status == 200) { return { success: true, data: response?.data?.data, pagination: response?.data?.pagination } }
            return { success: false, data: response?.data?.data };
        } catch (error) {
            console.error("Fetch User Profile error:", error);
            return { success: false };
        }

    }

    const updateProfile = async (body) => {
        let url = `${APIURL}profile/update/basic-info`;
        const method = "put";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, headers, body });
            if (response?.status == 200) { return { success: true, message: response?.data?.data?.message } }
            return { success: false, message: response?.data?.data?.message };
        } catch (error) {
            console.error("Update Profile User error:", error);
            return { success: false };
        }

    }

    return { fetchUserProfile, updateProfile };
}

export default profileService;
