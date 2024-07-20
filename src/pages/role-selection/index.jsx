import React from "react";
import "./index.css";
import "../../App.css";

const RoleSelector = () => {
    const handleRoleSelection = (role) => {
        alert(`Selected ${role}`);
    };

    return (
        <div className="form-select-role">
            <div className="form-body-select-role">
                <div className="form-select-role-tilte text-center m-5">
                    <h1>
                        Chào mừng đã đến với <span>ForBadminton</span>
                    </h1>
                </div>
                <div className="role-selector container">
                    <div className="card" onClick={() => handleRoleSelection("Customer")}>
                        <div className="card-inner">
                            <div className="card-front">
                                <div className="icon">👤</div>
                                <h2>Khách hàng</h2>
                            </div>
                            <div className="card-back">
                                <h2>Mô tả</h2>
                                <p>Xem thông tin các sân cầu lông</p>
                                <p>Đặt sân trực tuyến</p>
                                <p>Xem lịch sử đặt sân</p>
                            </div>
                        </div>
                    </div>
                    <div className="card" onClick={() => handleRoleSelection("Court Owner")}>
                        <div className="card-inner">
                            <div className="card-front">
                                <div className="icon">
                                    <i class="fa-solid fa-table-tennis-paddle-ball"></i>
                                </div>
                                <h2>Chủ sân</h2>
                            </div>
                            <div className="card-back">
                                <h2>Mô tả</h2>
                                <p>Quản lí các đơn đặt sân</p>
                                <p>Quản lí thông tin sân</p>
                                <p>Quản lí thông tin nhân viên</p>
                                <p>Xem thống kê</p>
                                <p>Xem feedback của khách hàng</p>
                                <p />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="title2 text-center m-5">
                    <p>Chọn đúng vai trò bạn muốn để chúng tôi có thể mang lại cho bạn trải nghiệm tốt nhất.</p>
                </div>
            </div>
        </div>
    );
};

export default RoleSelector;
