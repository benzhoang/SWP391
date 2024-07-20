import React, { Component } from "react";
import "../../css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import CheckInPage from "./staffPageComponents/CheckInPage";
import { Link } from "react-router-dom";
export default class StaffPage extends Component {
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
        };
    }

    componentDidMount() {
        this.checkLoginStatus();
    }

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
        const { isLoggedIn, user, courts, selectedCourtId, dropdownVisible } = this.state;
        return (
            <div className="staffPageManager">
                <section className="manager">
                    <div className="topbar">
                        <div className="logo">
                            <div className="logo-img">
                                <img src="asserts/img/logo-cau-long-dep-01.png" alt="logo" />
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
                        <div className="manager-left">
                            <div className="list-option">
                                <ul className="listManaher nav">
                                    <li className="nav-item">
                                        <a className="nav-link active" href="#checkIn" data-bs-toggle="tab">
                                            <span className="icon">
                                                <i className="fa-solid fa-file-invoice"></i>
                                            </span>
                                            <span className="title">Quản Lý Check-In</span>
                                        </a>
                                    </li>
                                    {/* <Link className="w-75 logout m-auto p-2 " to="/">
                                        <span className="icon">
                                            <i className="fas fa-sign-out-alt" />
                                        </span>
                                        <span className="title" onClickCapture={this.handleLogout}>
                                            Đăng xuất
                                        </span>
                                    </Link> */}
                                </ul>
                            </div>
                        </div>
                        <div className="manager-right">
                            <div className="tab-content">
                                <div className="tab-pane fade show active" id="checkIn" role="tabpanel">
                                    <CheckInPage />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <div className="footer-Manager">
                    <p>© Badminton Court Management - Team 4 - SWP391</p>
                </div>
            </div>
        );
    }
}
