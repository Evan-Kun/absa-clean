import axios from 'axios';

// Local Server
// export const APIURL = "http://localhost:3001/api/v1/"; 
// export const IMAGEPATH = "http://localhost:3001";          
// export const WEB_URL = "http://localhost:3000";          

// Live IP
// export const APIURL = "http://13.55.8.242:3001/api/v1/";
// export const IMAGEPATH = "http://13.55.8.242:3001";
// export const WEB_URL = "http://13.55.8.242:3002";

// Live Domain
export const APIURL = "https://api.bioinformaticservicealliance.au/api/v1/";
export const IMAGEPATH = "https://api.bioinformaticservicealliance.au";
export const WEB_URL = "https://bioinformaticservicealliance.au";


const apiHelper = () => {

    const methods = ["get", "post", "put", "patch", "delete"];
    const generateAxiosInstance = (contentType: any, timeout: any) => {
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
    }: {
        url: string;
        method: string;
        params?: any;
        body?: any;
        contentType?: string | null;
        headers?: Record<string, string>;
        timeout?: number;
    }) => {
        const axiosInstance: any = generateAxiosInstance(contentType, timeout);
        method = method.toLowerCase();

        if (methods.includes(method)) {
            const request = axiosInstance[method];
            let args: any[] = [url];

            if (method === "get" || method === "delete") {
                args.push({ params, headers });
            } else {
                args.push(body, { headers });
            }

            return request(...args).then((res: any) => res).catch((err: any) => {
                if (err?.status === 403) {
                    localStorage.clear();

                    window.location.replace('/home');
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
