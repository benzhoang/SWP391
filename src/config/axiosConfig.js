import axios from "axios";
import { showConfirmAlert } from "../utils/alertUtils";

const axiosInstance = axios.create({
    baseURL: "https://forbad.online:8443",
});

axiosInstance.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user ? user.accessToken : null;

    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (error.response.data.message === "Token không hợp lệ hoặc đã hết hạn.") {
                showConfirmAlert("Phiên đăng nhập đã hết hạn.", "Vui lòng đăng nhập lại để tiếp tục.", "Đăng nhập lại.", "top").then((result) => {
                    if (result.isConfirmed) {
                        localStorage.removeItem("jwtToken");
                        window.location.href = "/login";
                    }
                });
            } else if (error.response.data.message === "Không có token.") {
                showConfirmAlert("Thông báo", "Bạn hãy đăng nhập để tiếp tục !", "Đăng nhập", "top").then((result) => {
                    if (result.isConfirmed) {
                        localStorage.removeItem("jwtToken");
                        window.location.href = "/login";
                    }
                });
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
