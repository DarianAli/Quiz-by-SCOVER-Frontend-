import axios from "axios";
import type { AxiosError } from "axios";
import { BASE_API_URL } from "@/global";

const axiosInstance = axios.create({
    baseURL: BASE_API_URL
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
    } catch (error: any) {
        console.log("API ERROR:", error.message)
        return {
            data: {
                message: error.message
            }
        }
    }
}

export const post = async (url: string, data: any, token?: string) => {
    try {
        const headers: any = {}

        if (token) {
            headers.Authorization = `Bearer ${token}`
        }

        const result = await axiosInstance.post(url, data, { headers })

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

        console.log("API ERROR:", message)

        throw {
            response: {
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

        console.log("API ERROR:", message)

        throw {
            response: {
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

        console.log("API ERROR:", message)

        throw {
            response: {
                data: {
                    message
                }
            }
        }
    }
}