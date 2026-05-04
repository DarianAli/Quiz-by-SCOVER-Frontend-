// utils/apiBridge.ts
import axiosInstance from "@/utils/axiosInstance";
import { handleApiError } from "@/utils/handleApiError";

const buildHeaders = (
    token?: string,
    data?: string | FormData | Record<string, any>,
    customHeaders?: Record<string, string>
) => ({
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(data !== undefined && !(data instanceof FormData) && {
        "Content-Type": "application/json",
    }),
    ...customHeaders,
});

export const get = async (url: string, token?: string, customHeaders?: Record<string, string>) => {
    try {
        const result = await axiosInstance.get(url, {
            headers: buildHeaders(token, undefined, customHeaders),
        });
        return { status: true, data: result.data };
    } catch (error) {
        return handleApiError(error, `GET ${url}`);
    }
};

export const post = async (
    url: string,
    data?: string | FormData | Record<string, any>,
    token?: string,
    customHeaders?: Record<string, string>
) => {
    try {
        const result = await axiosInstance.post(url, data, {
            headers: buildHeaders(token, data, customHeaders),
        });
        return { status: true, data: result.data };
    } catch (error) {
        return handleApiError(error, `POST ${url}`);
    }
};

export const put = async (
    url: string,
    data?: string | FormData | Record<string, any>,
    token?: string,
    customHeaders?: Record<string, string>
) => {
    try {
        const result = await axiosInstance.put(url, data, {
            headers: buildHeaders(token, data, customHeaders),
        });
        return { status: true, data: result.data };
    } catch (error) {
        return handleApiError(error, `PUT ${url}`);
    }
};

export const drop = async (url: string, token?: string, customHeaders?: Record<string, string>) => {
    try {
        const result = await axiosInstance.delete(url, {
            headers: buildHeaders(token, undefined, customHeaders),
        });
        return { status: true, data: result.data };
    } catch (error) {
        return handleApiError(error, `DELETE ${url}`);
    }
};