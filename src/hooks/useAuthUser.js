import { useQuery } from "@tanstack/react-query"
import axiosInstance from "../lib/axios"

const useAuthUser = () => {
    const { isLoading, error, data } = useQuery({
        queryKey: ["authUser"],
        queryFn: async () => {
            const res = await axiosInstance.get("/user/getMe");
            return res;
        },
        retry: false,
    })
    return {
        isLoading,
        error,
        authUser: data?.data?.user || null, // Ensure we return null if user is not found
    }
}

export default useAuthUser;