import apiHelper, { APIURL } from "../api-helper";

const organizationProfileServices = () => {
    const { api } = apiHelper();

    const fetchOrganizationsDetails = async (sysName: any): Promise<any> => {
        const url = `${APIURL}organization/details/${sysName}`;
        const method = "get";

        try {
            const response = await api({ method, url });
            if (response?.status == 200) { return { success: true, ...response?.data } }
            return { success: false, ...response?.data?.data };
        } catch (error) {
            console.error("Error fetchOrganizationsDetails :", error);
            return { success: false, message: 'An error occurred' };
        }
    };

    const updateOrganizationsDetails = async (id: any, body: any): Promise<any> => {
        const url = `${APIURL}organization/update/${id}`;
        const method = "put";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, body, headers });
            if (response?.status == 200) { return { success: true, ...response?.data } }
            return { success: false, ...response?.data?.data };
        } catch (error) {
            console.error("Error fetchOrganizationsDetails :", error);
            return { success: false, message: 'An error occurred' };
        }
    };

    const contactOrganization = async (orgID: any, body: any): Promise<any> => {
        const url = `${APIURL}organization/contact/${orgID}`;
        const method = "post";

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api({ method, url, body, headers });
            if (response?.status == 200) { return { success: true, ...response?.data } }
            return { success: false, ...response?.data?.data };
        } catch (error) {
            console.error("Error contactOrganization :", error);
            return { success: false, message: 'An error occurred' };
        }
    };

    return {
        fetchOrganizationsDetails, updateOrganizationsDetails, contactOrganization
    };
}

export default organizationProfileServices;
