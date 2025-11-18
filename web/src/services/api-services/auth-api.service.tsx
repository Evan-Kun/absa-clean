import apiHelper, { APIURL } from "../api-helper";

const authServices = () => {
    const { api } = apiHelper();

    const LoginUser = async (body: any): Promise<any> => {
        const url = `${APIURL}auth/login`;
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

    const forgotPassword = async (body: any): Promise<any> => {
        const url = `${APIURL}auth/forgot-password`;
        const method = "post";

        try {
            const response = await api({ method, url, body });
            if (response?.status == 200) { return { success: true, data: response?.data?.data } }
            return { success: false, data: response?.data };
        } catch (error) {
            console.error("forgotPassword error:", error);
            return { success: false };
        }
    };

    const changePassword = async (body: any, token: any): Promise<any> => {
        const url = `${APIURL}auth/change-password/${token}`;
        const method = "post";

        try {
            const response = await api({ method, url, body });
            if (response?.status == 200) { return { success: true, data: response?.data } }
            return { success: false, data: response };
        } catch (error) {
            console.error("changePassword error:", error);
            return { success: false };
        }
    };

    return { LoginUser, forgotPassword,changePassword };
}

export default authServices;
