import apiHelper, { APIURL } from "../api-helper";

const userProfileServices = () => {
    const { api } = apiHelper();

    const fetchUserDetails = async (): Promise<any> => {
        const url = `${APIURL}user/details`;
        const method = "get";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, headers });
            if (response?.status == 200) { return { success: true, data: response?.data } }
            return { success: false, data: response?.data?.data };
        } catch (error) {
            console.error("Error fetch user Details :", error);
            return { success: false, message: 'An error occurred' };
        }
    };

    const fetchProfiles = async (userID: string): Promise<any> => {
        const url = `${APIURL}profile/list`;
        const method = "get";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, headers });
            if (response?.status == 200) { return { success: true, data: response?.data?.data } }
            return { success: false, message: response?.data?.message || 'An error occurred', data: response?.data };
        } catch (error) {
            console.error("Error fetch user profile Details :", error);
            return { success: false, message: 'An error occurred' };
        }
    };

    const fetchProfileBasicDetails = async (userID: string): Promise<any> => {
        const url = `${APIURL}profile/basic/${userID}`;
        const method = "get";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, headers });
            if (response?.status == 200) { return { success: true, data: response?.data?.data } }
            return { success: false, message: response?.data?.message || 'An error occurred', data: response?.data };
        } catch (error) {
            console.error("Error fetch user profile Details :", error);
            return { success: false, message: 'An error occurred' };
        }
    };


    const fetchOrganizations = async (): Promise<any> => {
        const url = `${APIURL}auth/organizations`;
        const method = "get";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, headers });
            if (response?.status == 200) { return { success: true, data: response?.data?.data } }
            return { success: false, message: response?.data?.message || 'An error occurred', data: response?.data };
        } catch (error) {
            console.error("Error fetch orgazations :", error);
            return { success: false, message: 'An error occurred' };
        }

    }

    const updateProfileBasicDetails = async (body: Object, type: string): Promise<any> => {

        const url = `${APIURL}profile/update/${type}`;
        const method = "put";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, body, headers });
            if (response?.status == 200) { return { success: true, message: response?.data?.data?.message, data: response?.data?.data } }
            return { success: false, data: response?.data?.data };
        } catch (error) {
            console.error("Error fetch user profile Details :", error);
            return { success: false, message: 'An error occurred' };
        }
    };

    const fetchProfileHistoryDetails = async (userID: string): Promise<any> => {
        const url = `${APIURL}profile/details/${userID}`;
        const method = "get";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, headers });
            if (response?.status == 200) { return { success: true, data: response?.data?.data } }
            return { success: false, message: response?.data?.message || 'An error occurred', data: response?.data };
        } catch (error) {
            console.error("Error fetchProfileHistoryDetails :", error);
            return { success: false, message: 'An error occurred' };
        }
    };

    const deleteProfileData = async (type: string, recordId: string, userId: any = null): Promise<any> => {
        let url = `${APIURL}profile/delete/${type}/${recordId}`;
        if (userId) { url += `?userID=${userId}` }
        const method = "delete";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, headers });
            if (response?.status == 200) { return { success: true, message: response?.data?.data?.message } }
            return { success: false, message: response?.data?.message || 'An error occurred' };
        } catch (error) {
            console.error("Error deleteProfileData :", error);
            return { success: false };
        }
    };

    const fetchUserProfileList = async (page: Number, limit: Number, body = {}): Promise<any> => {
        let url = `${APIURL}profile/active-list`;
        if (page && limit) { url += `?page=${page}&limit=${limit}` }
        const method = "post";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, body, headers });
            if (response?.status == 200) { return { success: true, data: response?.data?.data, pagination: response?.data?.pagination } }
            return { success: false, message: response?.data?.message || 'An error occurred', data: response?.data };
        } catch (error: any) {
            console.error("Error fetchUserProfileList :", error);
            return { success: false, message: error?.message || 'An error occurred' };
        }
    };

    const fetchProfile = async (sysName: string = ''): Promise<any> => {
        let url = `${APIURL}profile/validate/${sysName}`;
        const method = "get";
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, headers });
            if (response?.status == 200) { return { success: true, data: response?.data?.data } }
            return { success: false, message: response?.data?.message || 'An error occurred', data: response?.data };

        } catch (error: any) {
            console.error("Error fetchProfile :", error);
            return { success: false, message: error?.message || 'An error occurred' };
        }
    };

    const updateOrder = async (tablename: any, body: any): Promise<any> => {
        const url = `${APIURL}profile/change-order/${tablename}`;
        const method = "put";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, body, headers });
            if (response?.status == 200) { return { success: true, message: response?.data?.data?.message } }
            return { success: false, data: response?.data?.data };
        } catch (error) {
            console.error("Error update order :", error);
            return { success: false, message: 'An error occurred' };
        }
    };

    return {
        fetchUserDetails,
        fetchProfileBasicDetails,
        fetchOrganizations,
        updateProfileBasicDetails,
        fetchProfileHistoryDetails,
        deleteProfileData,
        fetchUserProfileList,
        fetchProfile,
        updateOrder
    };
}

export default userProfileServices;
