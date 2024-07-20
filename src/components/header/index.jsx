import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./index.css";
import "../../App.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import forbad_logo from "../../assets/images/forbad_logo.png";
import { NavLink } from "react-router-dom";
import axiosInstance from "../../config/axiosConfig";

const Header = ({ isLoggedIn, user, handleLogout }) => {
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const hideDropdown = () => {
        setDropdownVisible(false);
    };

    const handleShowTermsModal = () => {
        setShowTermsModal(true);
    };

    const handleCloseTermsModal = () => {
        setShowTermsModal(false);
    };

    const handleAcceptTerms = async () => {
        try {
            const response = await axiosInstance.put("/member/update-role", { userId: user.userId, role: "manager" });
            if (response.status === 200) {
                const data = response.data;

                localStorage.setItem("user", JSON.stringify(data));

                handleCloseTermsModal();
                window.location.href = "/court-manager";
            } else {
                // Handle non-200 responses if necessary
                console.error("Failed to update role:", response.status);
            }
        } catch (error) {
            console.error("Failed to update role:", error);
        }
    };

    return (
        <div>
            <section className="header">
                <div className="header-top container row">
                    <div className="logo col-md-2">
                        <Link to="/">
                            <img src={forbad_logo} alt="Logo" />
                        </Link>
                    </div>
                    <div className="header-bot col-lg-6 col-md-7">
                        <NavLink exact to="/" activeClassName="active">
                            Trang Chủ
                        </NavLink>
                        <NavLink to="/aboutUs" activeClassName="active">
                            Giới Thiệu
                        </NavLink>
                        <NavLink to="/contact" activeClassName="active">
                            Liên Hệ
                        </NavLink>
                        <NavLink to="/rules" activeClassName="active">
                            Quy Định
                        </NavLink>
                    </div>
                    <div className="header-top-right col-lg-4 col-md-3">
                        <div className="login w-100">
                            {isLoggedIn ? (
                                <div className="user-info" onClick={toggleDropdown}>
                                    <div className="user d-flex">
                                        <div className="user-name">
                                            <p>{user.username}</p>
                                        </div>
                                        <img src={user.avatar} alt="User Avatar" />
                                    </div>

                                    {dropdownVisible && (
                                        <div className="user-infor-dropdown">
                                            <ul className="p-0 m-0">
                                                <li>
                                                    <Link to="/profile" onClick={hideDropdown}>
                                                        <i className="fa-solid fa-user"></i> Hồ sơ
                                                    </Link>
                                                </li>
                                                <li>
                                                    {isLoggedIn && (
                                                        <Link to="/playing-schedule" onClick={hideDropdown}>
                                                            <i className="fa-solid fa-calendar"></i> Lịch chơi
                                                        </Link>
                                                    )}
                                                </li>
                                                <li>
                                                    {isLoggedIn && user.roles.includes("manager") ? (
                                                        <Link to="/court-manager" onClick={hideDropdown}>
                                                            <i className="fa-solid fa-shop"></i> Cơ sở của tôi
                                                        </Link>
                                                    ) : isLoggedIn && user.roles.includes("staff") ? (
                                                        <Link to="/staff" onClick={hideDropdown}>
                                                            <i className="fa-solid fa-shop"></i> Quản lý check-in
                                                        </Link>
                                                    ) : isLoggedIn && user.roles.includes("admin") ? (
                                                        <Link to="/admin" onClick={hideDropdown}>
                                                            <i className="fa-solid fa-shop"></i> Trang Admin
                                                        </Link>
                                                    ) : (
                                                        <Link
                                                            onClick={() => {
                                                                hideDropdown();
                                                                handleShowTermsModal();
                                                            }}
                                                        >
                                                            <i className="fa-solid fa-shop"></i> Đăng ký kinh doanh
                                                        </Link>
                                                    )}
                                                </li>
                                                <li>
                                                    {isLoggedIn && (
                                                        <Link to="/historyOrder" onClick={hideDropdown}>
                                                            <i className="fa-solid fa-clock-rotate-left"></i> Lịch sử đặt hàng
                                                        </Link>
                                                    )}
                                                </li>
                                                <li>
                                                    {isLoggedIn && (
                                                        <Link onClick={handleLogout}>
                                                            <i className="fa-solid fa-sign-out"></i> Đăng xuất
                                                        </Link>
                                                    )}
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="auth-buttons w-100">
                                    <Link to="/login" className="btn btn-primary login-link" style={{ marginRight: "5px" }}>
                                        Đăng nhập
                                    </Link>
                                    <Link to="/register" className="btn btn-outline-primary register-link">
                                        Đăng ký
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Modal show={showTermsModal} onHide={handleCloseTermsModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Điều khoản và Điều kiện</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h5>1. Giới thiệu</h5>
                    <p>Chào mừng bạn đến với ứng dụng ForBAD. Khi sử dụng ứng dụng này, bạn đồng ý tuân thủ các điều khoản và điều kiện dưới đây.</p>

                    <h5>2. Dịch vụ của chúng tôi</h5>
                    <p>
                        ForBAD cung cấp dịch vụ đặt sân cầu lông trực tuyến, giúp bạn dễ dàng tìm kiếm và đặt chỗ sân cầu lông phù hợp nhất với nhu
                        cầu của mình.
                    </p>

                    <h5>3. Quyền và trách nhiệm của người dùng</h5>
                    <ul>
                        <li>Người dùng cam kết cung cấp thông tin chính xác và đầy đủ khi đăng ký và sử dụng dịch vụ của chúng tôi.</li>
                        <li>Người dùng chịu trách nhiệm bảo mật thông tin tài khoản và mật khẩu của mình.</li>
                        <li>
                            Người dùng không được sử dụng dịch vụ của chúng tôi cho các mục đích phi pháp, lừa đảo, hoặc gây tổn hại đến người khác.
                        </li>
                    </ul>

                    <h5>4. Chính sách bảo mật</h5>
                    <p>
                        Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn và chỉ sử dụng nó cho các mục đích liên quan đến dịch vụ của chúng tôi. 
                    </p>

                    <h5>5. Thay đổi điều khoản và điều kiện</h5>
                    <p>
                        Chúng tôi có quyền thay đổi các điều khoản và điều kiện này bất kỳ lúc nào. Những thay đổi sẽ được cập nhật trên ứng dụng và
                        có hiệu lực ngay sau khi được đăng tải.
                    </p>

                    <h5>6. Liên hệ</h5>
                    <p>
                        Nếu bạn có bất kỳ câu hỏi nào về các điều khoản và điều kiện này, vui lòng liên hệ với chúng tôi qua email:
                        support@forbad.com.
                    </p>

                    <h5>7. Điều khoản khác</h5>
                    <p>
                        Việc bạn tiếp tục sử dụng dịch vụ của chúng tôi sau khi các điều khoản và điều kiện đã được sửa đổi có nghĩa là bạn chấp nhận
                        và đồng ý tuân theo các thay đổi đó.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseTermsModal} className="p-2">
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleAcceptTerms} className="p-2">
                        Chấp nhận và tiếp tục
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Header;
