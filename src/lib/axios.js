import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "https://shuvochat-backend.onrender.com/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    }
});

export default axiosInstance;