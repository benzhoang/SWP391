import React, { Component } from "react";
import axios from "axios";
import "../../css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./manager.css";
import Court from "./Court";
import Staff from "./Staff";
import Yard from "./Yard";
import Services from "./Services";
import Order from "../court_manager/dashboardComponent/order/Order";
import Slot from "./Slot";
import axiosInstance from "../../config/axiosConfig";
import Dashboard from "./Dashboard";
import PriceBoardManager from "./PriceBoardManager";

export default class CourtManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: false,
            user: {
                username: "",
                avatar: "",
                userId: "",
            },
            courts: [],

            selectedCourtId: "",
            dropdownVisible: false,
            isOpen: true,
        };
    }

    componentDidMount() {
        this.checkLoginStatus();
        this.fetchCourts();
    }

    toggleMenu = () => {
        this.setState((prevState) => ({
            isOpen: !prevState.isOpen,
        }));
    };

    checkLoginStatus = () => {
        const user = JSON.parse(localStorage.getItem("user"));

        if (user) {
            this.setState({
                isLoggedIn: true,
                user: {
                    username: user.fullName,
                    avatar: user.imageUrl,
                    userId: user.userId,
                },
            });
        } else {
            window.location.href = "/login"; // Chuyển hướng đến trang đăng nhập nếu không đăng nhập
        }
    };

    fetchCourts = async () => {
        try {
            const res = await axiosInstance.get("/court/courts-of-owner");
            this.setState({ courts: res.data });
        } catch (error) {
            console.error("Không thể lấy dữ liệu từ API", error);
        }
    };

    handleCourtChange = (event) => {
        this.setState({ selectedCourtId: event.target.value });
    };

    handleLogout = () => {
        localStorage.clear();
        this.setState({
            isLoggedIn: false,
            user: {
                username: "",
                avatar: "",
            },
        });
        window.location.href = "/"; // Chuyển hướng đến trang chủ sau khi đăng xuất
    };

    toggleDropdown = () => {
        this.setState((prevState) => ({
            dropdownVisible: !prevState.dropdownVisible,
        }));
    };

    render() {
        const { isLoggedIn, user, courts, selectedCourtId, dropdownVisible, isOpen } = this.state;
        console.log("userId", user.userId);
        return (
            <div className="court_managerPage">
                <section className="manager">
                    <div className="topbar">
                        <div className="logo">
                            <div className="logo-img">
                                <img src="asserts/img/logo-cau-long-dep-01.png" alt="logo" style={{ marginRight: 10 }} />
                            </div>
                            <div className="nameapp">
                                <p>ForBaD</p>
                            </div>
                        </div>
                        <div className="search">
                            {/* <input type="text" placeholder="Tìm kiếm tại đây." id="search" /> */}
                            {/* <label htmlFor="search">
                                <i className="fa-solid fa-magnifying-glass" />
                            </label> */}
                        </div>
                        <div className="login" onClick={this.toggleDropdown}>
                            <img src={user.avatar} alt="User Avatar" style={{ width: 50, borderRadius: "50%", marginRight: 10 }} />
                            <p className="user-name">{user.username}</p>
                            {dropdownVisible && (
                                <div className="dropdownItem">
                                    <div className="user-infor-dropdown">
                                        <ul className="p-0 m-0">
                                            <li>
                                                <a href="/">
                                                    <i className="fa-solid fa-home"></i> Trang chủ
                                                </a>
                                            </li>
                                            <li>
                                                <a href="/profile">
                                                    <i className="fa-solid fa-user"></i> Hồ sơ
                                                </a>
                                            </li>
                                            <li>
                                                <a onClick={this.handleLogout}>
                                                    <i className="fas fa-sign-out-alt"></i> Đăng xuất
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="body-manager">
                        <div className={`manager-left ${isOpen ? "" : "closed"}`}>
                            <div className="list-option">
                                <ul className="listManager nav">
                                    <div className="toggle-button" onClick={this.toggleMenu}>
                                        <i className={`fa-solid ${isOpen ? "fa-x" : "fa-bars"}`} />
                                    </div>
                                    <li className="nav-item">
                                        <a className="nav-link active" href="#dsDashboard" data-bs-toggle="tab">
                                            <span className="icon">
                                                <i className="fa-solid fa-chart-line" />
                                            </span>
                                            <span className="title">Thống Kê</span>
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="#dsOrder" data-bs-toggle="tab">
                                            <span className="icon">
                                                <i className="fa-solid fa-file-invoice"></i>
                                            </span>
                                            <span className="title">Quản Lý Đơn Hàng</span>
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="#dsStaff" data-bs-toggle="tab">
                                            <span className="icon">
                                                <i className="fa-solid fa-computer" />
                                            </span>
                                            <span className="title">Quản Lý Nhân Viên</span>
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="#dsCoSo" data-bs-toggle="tab">
                                            <span className="icon">
                                                <i className="fa-solid fa-shop" />
                                            </span>
                                            <span className="title">Quản Lý Cơ Sở</span>
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="#dsYard" data-bs-toggle="tab">
                                            <span className="icon">
                                                <i className="fa fa-table-tennis"></i>
                                            </span>
                                            <span className="title">Quản Lý Sân</span>
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="#dsSlot" data-bs-toggle="tab">
                                            <span className="icon">
                                                <i className="fa-solid fa-clock"></i>
                                            </span>
                                            <span className="title">Quản Lý Slot</span>
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="#dsServices" data-bs-toggle="tab">
                                            <span className="icon">
                                                <i className="fa-solid fa-mug-saucer"></i>
                                            </span>
                                            <span className="title">Quản Lý Tiện Ích</span>
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="#dsPrice" data-bs-toggle="tab">
                                            <span className="icon">
                                                <i className="fa-solid fa-money-bill"></i>
                                            </span>
                                            <span className="title">Quản Lý Bảng Giá</span>
                                        </a>
                                    </li>
                                    {/* <a className="w-75 logout m-auto" href="/">
                                        <span className="icon">
                                            <i className="fas fa-sign-out-alt" />
                                        </span>
                                        <span className="title" onClickCapture={this.handleLogout}>
                                            Đăng xuất
                                        </span>
                                    </a> */}
                                </ul>
                            </div>
                        </div>
                        <div className={`manager-right ${isOpen ? "" : "expanded"}`}>
                            <div className="tab-content" id="nav-tabContent">
                                <div className="tab-pane fade show active" id="dsDashboard">
                                    <Dashboard />
                                </div>
                                <div className="tab-pane fade" id="dsOrder">
                                    <Order selectedCourtId={selectedCourtId} />
                                </div>
                                <div className="tab-pane fade" id="dsStaff">
                                    <Staff selectedCourtId={selectedCourtId} managerId={user.userId} />
                                </div>
                                <div className="tab-pane fade" id="dsCoSo">
                                    <Court />
                                </div>
                                <div className="tab-pane fade" id="dsYard">
                                    <Yard selectedCourtId={selectedCourtId} />
                                </div>
                                <div className="tab-pane fade" id="dsSlot">
                                    <Slot />
                                </div>
                                <div className="tab-pane fade" id="dsServices">
                                    <Services />
                                </div>
                                <div className="tab-pane fade" id="dsPrice">
                                    <PriceBoardManager />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}
