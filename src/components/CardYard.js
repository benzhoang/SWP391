import React from "react";
import { useNavigate } from "react-router-dom";

const CardYard = ({ court }) => {
    const navigate = useNavigate();

    const handleBookingClick = (e) => {
        e.preventDefault(); // Prevent default anchor behavior
        navigate("/bookingPage", { state: { court } });
    };

    // Kiểm tra xem court có tồn tại và có thuộc tính imageUrl không
    if (!court || !court.imageUrl) {
        return null; // Trả về null nếu không có dữ liệu hợp lệ
    }

    return (
        <div className="card-yard" style={{ height: 400 }}>
            <div className="card-yard-img ">
                {court.imageUrl && <img src={court.imageUrl} alt="Ảnh Sân" />} {/* Kiểm tra imageUrl trước khi sử dụng */}
            </div>
            <div className="card-yard-content" style={{ height: "37%" }}>
                <h6 style={{ fontSize: "16px" }}>
                    <h6>{court.courtName}</h6>
                </h6>
                <p>
                    <b>Địa chỉ:</b> {court.address}
                </p>
                <p>
                    <b>Số sân:</b> {court.yards.length}
                </p>
                <p>
                    <b>Giờ mở cửa:</b> {court.openTime} - {court.closeTime}
                </p>
            </div>
            <div>
                {" "}
                <button className="btn btn-primary p-2  w-50" onClick={handleBookingClick} style={{ color: "white", backgroundColor: "#002e86" }}>
                    Đặt Ngay
                </button>
            </div>
        </div>
    );
};

export default CardYard;
