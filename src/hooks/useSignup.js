import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";

const useSignUp = ({ onSuccessCallback } = {}) => {
    const queryClient = useQueryClient();

    const { mutate, isPending, error } = useMutation({
        mutationFn: async (signupData) => {
            // Client-side validation
            if (signupData.fullName.length < 2) {
                throw new Error("Full name must be at least 2 characters long");
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
                throw new Error("Invalid email address");
            }
            if (signupData.password.length < 6) {
                throw new Error("Password must be at least 6 characters long");
            }

            // Replace with your actual API endpoint
            const response = await axiosInstance.post("/user/register", signupData);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            if (onSuccessCallback) {
                onSuccessCallback(data); // Call the provided callback
            }
        },
        onError: (error) => {
            console.error("Signup error:", error.message);
        },
    });

    return { isPending, error, signupMutation: mutate };
};

export default useSignUp;