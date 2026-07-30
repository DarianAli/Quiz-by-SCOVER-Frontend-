import axios from "axios";
import type { AxiosError } from "axios";
import { BASE_API_URL } from "@/global";

const axiosInstance = axios.create({
    baseURL: BASE_API_URL,
    withCredentials: true
})

export const get = async (
    url: string,
    token?: string,
    customHeaders?: any
) => {
    try {
        const result = await axiosInstance.get(url, {
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
                ...customHeaders 
            }
        })

        return result
    } catch (error) {
        const err = error as AxiosError<any>
        const message =
            err.response?.data?.message ??
            err.message ??
            "Something went wrong"

        const status = err.response?.status || "Unknown";
        console.error(`[API ERROR] Endpoint: ${url}`);
        console.error(`[API ERROR] Status: ${status} - ${message}`);

        throw {
            response: {
                status,
                data: { message }
            }
        }
    }
}

// 


export const post = async (url: string, data: any, token?: string) => {
    try {
        const headers: any = {}
        if (token) headers.Authorization = `Bearer ${token}`
        const result = await axiosInstance.post(url, data, { headers })
        return { status: true, data: result.data }
    } catch (error) {
        const err = error as AxiosError<any>
        const status = err.response?.status
        const message = err.response?.data?.message ?? err.message ?? "Something went wrong"

        const isExpected = status !== undefined && [400, 401, 403, 404, 422].includes(status)

        if (isExpected) {
            console.warn(`[API WARN] ${url} → ${status}: ${message}`)
        } else {
            console.error(`[API ERROR] ${url} → ${status ?? "Unknown"}: ${message}`)
        }

        throw {
            response: {
                status,          // ← sekarang ikut dilempar
                data: { message }
            }
        }
    }
}

export const put = async (url: string, data: any, token?: string) => {
    try {
        const headers: any = {}

        if (token) {
            headers.Authorization = `Bearer ${token}`
        }

        const result = await axiosInstance.put(url, data, { headers })

        return {
            status: true,
            data: result.data
        }
    } catch (error) {
        const err = error as AxiosError<any>

        const message =
            err.response?.data?.message ??
            err.message ??
            "Something went wrong"

        const status = err.response?.status || "Unknown";
        console.error(`[API ERROR] Endpoint: ${url}`);
        console.error(`[API ERROR] Status: ${status} - ${message}`);

        throw {
            response: {
                status,
                data: { message }
            }
        }
    }
}

export const drop = async (url: string, token: string) => {
    try {
        let result = await axiosInstance.delete(url, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })

        return{
            status: true,
            data: result.data
        }
    } catch (error) {
        const err = error as AxiosError<any>

        const message =
            err.response?.data?.message ??
            err.message ??
            "Something went wrong"

        const status = err.response?.status || "Unknown";
        console.error(`[API ERROR] Endpoint: ${url}`);
        console.error(`[API ERROR] Status: ${status} - ${message}`);

        throw {
            response: {
                status,
                data: {
                    message
                }
            }
        }
    }
}