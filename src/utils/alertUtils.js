// src/utils/alertUtils.js

import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.css';
import '../../src/styles/alertStyles.css';

export const showAlert = (icon, title, text, position) => {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        timer: 3000, // Thời gian tự động đóng (ms)
        timerProgressBar: true, // Thanh tiến độ thời gian
        showConfirmButton: false, // Không hiển thị nút OK
        position: position, // Đặt vị trí thông báo ở góc trên bên phải
        toast: true, // Thêm tính năng toast để thông báo tự đóng
        customClass: {
            popup: icon, // Tùy chỉnh CSS cho hộp thoại
        }
    });
};

export const showConfirmAlert = async (title, text, confirmText, position) => {
    const result = await Swal.fire({
        title: title,
        text: text,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        position: position,
        confirmButtonText: confirmText,
        cancelButtonText: "Đóng"
    });
    return result;
};

export const showConfirmPayment = async (title, text, icon, confirmText, cancleText, position) => {
    const result = await Swal.fire({
        title: title,
        text: text,
        icon: icon,
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#28a745",
        position: position,
        confirmButtonText: confirmText,
        cancelButtonText: cancleText,
    });
    return result;
};

export const alert = (icon, title, text, position) => {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        showConfirmButton: true,
        position: position,
        customClass: {
            popup: icon, 
        }
    });
};
