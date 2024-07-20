import { showConfirmAlert } from "./alertUtils";

export const handleTokenError = () => {
    showConfirmAlert("Phiên đăng nhập đã hết hạn.", "Vui lòng đăng nhập lại để tiếp tục.", 'Đăng nhập lại.' ,'top')
            .then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem('jwtToken');
                    window.location.href = '/login';
                }
            })   
};