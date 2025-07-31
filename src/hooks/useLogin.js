import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import axiosInstance from "../lib/axios";

const useLogin = ({ onSuccessCallback } = {}) => {
    const queryClient = useQueryClient();

    const { mutate, isPending, error } = useMutation({
        mutationFn: async (loginData) => {
            // Client-side validation
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
                throw new Error("Invalid email address");
            }
            if (loginData.password.length < 6) {
                throw new Error("Password must be at least 6 characters long");
            }

            try {
                const response = await axiosInstance.post("/user/login", loginData, {
                    withCredentials: true,
                });
                return response.data;
            } catch (err) {
                if (err.response) {
                    throw new Error(err.response.data.message || "Login failed");
                }
                throw err;
            }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            if (onSuccessCallback) {
                onSuccessCallback(data);
            }
        },
        onError: (error) => {
            console.error("Login error:", error.message);
        },
    });

    return { isPending, error, loginMutation: mutate };
};

export default useLogin;