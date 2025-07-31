import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { useNavigate } from "react-router-dom";

const useLogout = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { mutate: logoutMutation } = useMutation({
        mutationFn: async () => {
            const res = axiosInstance.post("/user/logout", {}, {
                withCredentials: true,
            });
            return res;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        onError: (error) => {
            console.error("Logout error:", error.message);
        },
        retry: false,
        // navigate to login page after logout
        onSettled: () => {
            navigate("/login");
        },
    });

    return { logoutMutation };
}

export default useLogout;