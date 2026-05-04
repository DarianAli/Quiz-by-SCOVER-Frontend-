import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
    timeout: 10000,
    headers: {
        "Accept": "application/json",
    },
});

export default axiosInstance;