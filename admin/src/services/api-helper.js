import axios from 'axios';
// Local Server
// export const APIURL = "http://localhost:3002/api/v1/";
// export const IMAGEPATH = "http://localhost:3002";
// export const WEB_URL = "http://localhost:3000";

// Live server
// export const APIURL = "http://13.55.8.242:3001/api/v1/";
// export const IMAGEPATH = "http://13.55.8.242:3001";
// export const WEB_URL = "http://13.55.8.242:3002";

// Live Domain
const API_PREFIX = 'api/v1/'
export const API = 'https://api.bioinformaticservicealliance.au/'
export const APIURL = `${API}${API_PREFIX}`;
export const IMAGEPATH = "https://api.bioinformaticservicealliance.au";
export const WEB_URL = "https://bioinformaticservicealliance.au";


export const DEFAULTU_USER_PASSWORD = "TD123##";

// Data table default paginations
export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 10

const apiHelper = () => {

    const methods = ["get", "post", "put", "patch", "delete"];
    const generateAxiosInstance = (contentType, timeout) => {
        return axios.create({
            headers: {
                'Content-Type': contentType || 'application/json',
            },
            timeout: timeout || 15000,
        });
    };

    const api = async ({
        url,
        method,
        params = null,
        body = null,
        contentType = null,
        headers = {},
        timeout = undefined,
    }) => {
        const axiosInstance = generateAxiosInstance(contentType, timeout);
        method = method.toLowerCase();

        if (methods.includes(method)) {
            const request = axiosInstance[method];
            let args = [url];

            if (method === "get" || method === "delete") {
                args.push({ params, headers });
            } else {
                args.push(body, { headers });
            }

            return request(...args).then((res) => res).catch((err) => {
                if (err?.status === 403) {
                    localStorage.clear();
                    window.location.replace('/login');
                    // alert(err?.response?.data?.message || 'Access denied.')
                }
                console.error("API request error:", err);
                return err?.response;
            });
        } else {
            throw new Error(`Invalid HTTP Method - ${method}`);
        }
    };

    return { api };
}

export default apiHelper;
