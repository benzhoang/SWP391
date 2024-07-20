import React, { Component } from "react";
import "./style.css";
import Footer from "../../../components/footer";
import Header from "../../../components/header";
import { showAlert } from "../../../utils/alertUtils";

export default class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: false,
            user: {
                username: "",
                avatar: "",
                email: ""
            },
            password: "",
            errors: {
                username: "",
                email: "",
                password: ""
            },
        };
    }

    componentDidMount() {
        this.fetchUserFromLocalStorage();
    }

    fetchUserFromLocalStorage() {
        const user = JSON.parse(localStorage.getItem("user"));

        if (user) {
            this.setState({
                isLoggedIn: true,
                user: {
                    username: user.fullName,
                    avatar: user.imageUrl,
                    email: user.email
                },
            });
        }
    }

    handleLogout = () => {
        localStorage.removeItem("user");
        this.setState({
            isLoggedIn: false,
            user: {
                username: "",
                avatar: "",
                email: ""
            },
        });
        window.location.href = "/";
    };

    validateField = (name, value) => {
        let error = "";

        if (name === "username") {
            if (value.length === 0) {
                error = "Vui lòng nhập tên người dùng";
            } else if (name === "email") {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value.match(emailPattern)) {
                    error = "Vui lòng nhập email hợp lệ";
                }
            } else if (name === "password") {
                if (value.length < 8) {
                    error = "Mật khẩu phải có ít nhất 8 ký tự";
                }
            }
        }
        this.setState((prevState) => ({
            errors: {
                ...prevState.errors,
                [name]: error,
            },
        }));
    };

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState((prevState) => ({
            user: {
                ...prevState.user,
                [name]: value,
            },
        }));

        this.validateField(name, value);
    };

    handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                this.setState((prevState) => ({
                    user: {
                        ...prevState.user,
                        avatar: reader.result,
                    },
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    handleSubmit = (e) => {
        e.preventDefault();
        if (this.validateForm()) {
            const { user } = this.state;
            localStorage.setItem("user", JSON.stringify(user));
            showAlert("success", "", "Cập nhật thông tin thành công", "top-end")
            this.setState({
                user,
            });
        }
    };

    validateForm = () => {
        const { username, email } = this.state.user;
        const password = this.state;
        const errors = {};

        if (username.length === 0) {
            errors.username = "Vui lòng nhập tên người dùng";
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.match(emailPattern)) {
            errors.email = "Vui lòng nhập email hợp lệ";
        }

        if (password.length < 6) {
            errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }

        this.setState({ errors });

        return Object.keys(errors).length === 0;
    };

    render() {
        const { isLoggedIn, user, errors } = this.state;
        return (
            <div className="profile">
                <section className="header">
                    <Header isLoggedIn={isLoggedIn} user={user} handleLogout={this.handleLogout} />
                </section>
                <div className="form-showProfile w-1/3 my-5 m-auto">
                    <form className="showProfile" onSubmit={this.handleSubmit}>
                        <div className="showProfile-title">
                            <h3>Thông tin của bạn</h3>
                        </div>
                        <div className="showAvatar text-center">
                            <img src={user.avatar} alt="User Avatar" />
                            <label className="custom-file-upload" style={{ cursor: "pointer" }}>
                                <input type="file" onChange={this.handleAvatarChange} />
                                Chỉnh sửa
                            </label>
                        </div>
                        <div className="mb-2">
                            <label htmlFor="username" className="form-label">
                                Họ và tên:
                            </label>
                            <input
                                type="text"
                                className={`form-control ${errors.username ? "is-invalid" : ""}`}
                                id="username"
                                name="username"
                                value={user.username}
                                onChange={this.handleInputChange}
                            />
                            {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                        </div>
                        <div className="mb-2">
                            <label htmlFor="email" className="form-label">
                                Email:
                            </label>
                            <input
                                type="text"
                                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                id="email"
                                name="email"
                                value={user.email}
                                onChange={this.handleInputChange}
                                readOnly
                            />
                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                        </div>
                        <div className="mb-2 d-flex align-items-center">
                            <div className="flex-grow-1">
                                <label htmlFor="password" className="form-label">
                                    Mật khẩu:
                                </label>
                                <input
                                    type="password"
                                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                                    id="password"
                                    name="password"
                                    value="********"
                                    onChange={this.handleInputChange}
                                />
                                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                            </div>
                            {/* <div className="flex-grow-1">
                                <label htmlFor="password" className="form-label">
                                    Mật khẩu:
                                </label>
                                <input
                                    type=""
                                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                                    id="password"
                                    name="password"
                                    value="********"
                                    onChange={this.handleInputChange}
                                />
                                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                            </div> */}
                        </div>
                        <button className="btn btn-primary m-0 p-2" type="submit">
                            Cập nhật thay đổi
                        </button>
                    </form>
                </div>
                <Footer />
            </div>
        );
    }
}
