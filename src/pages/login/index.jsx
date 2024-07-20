import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import HeaderLoginForm from "../../components/header-login-form";
import Footer from "../../components/footer";
import "./index.css";
import "../../App.css";
import { showAlert } from "../../utils/alertUtils";
import axiosInstance from "../../config/axiosConfig";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const navigate = useNavigate();

    const setParams = (event) => {
        if (event.target.name === "email") {
            setEmail(event.target.value);
        } else if (event.target.name === "password") {
            setPassword(event.target.value);
        }
    };

    const login = (event) => {
        event.preventDefault();

        // Reset previous error messages
        setEmailError("");
        setPasswordError("");

        // Email validation
        if (!email.endsWith("@gmail.com")) {
            setEmailError("Email phải có đuôi là @gmail.com");
            return;
        }

        // Password validation
        if (password.length < 8) {
            setPasswordError("Mật khẩu phải có ít nhất 8 ký tự");
            return;
        }

        // If validations pass, proceed with login
        axiosInstance
            .post("/auth/signin", {
                email: email,
                password: password,
            })
            .then((response) => {
                if (response.status === 200) {
                    const data = response.data;

                    localStorage.setItem("user", JSON.stringify(data));

                    console.log("Authentication successful");

                    // Chuyển hướng người dùng sau khi đăng nhập thành công
                    window.location.href = "/";
                } else {
                    showAlert("error", "Đăng nhập không thành công!", "Sai email hoặc mật khẩu. Vui lòng thử lại.", "top-end");
                }
            })
            .catch((error) => {
                showAlert("error", "Đăng nhập không thành công!", "Sai email hoặc mật khẩu. Vui lòng thử lại.", "top-end");
                console.error(error);
            });
    };

    const handleGoogleLogin = (event) => {
        event.preventDefault();

        axiosInstance
            .get("/auth/google")
            .then((response) => {
                if (response.status === 200) {
                    const data = response.data;

                    if (data && data.redirectUrl) {
                        window.location.href = data.redirectUrl;
                    } else {
                        showAlert("error", "Lỗi !", "Có lỗi xảy ra. Vui lòng thử lại.", "top-end");
                    }
                } else {
                    showAlert("error", "Lỗi !", "Có lỗi xảy ra. Vui lòng thử lại.", "top-end");
                }
            })
            .catch((error) => {
                showAlert("error", "", "Đăng nhập không thành công.", "top-end");
                console.error(error);
            });
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        const sendCodeToBackend = async () => {
            try {
                const response = await fetch("https://forbad.online:8443/auth/google/callback", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ code }),
                });

                if (!response.ok) {
                    showAlert("error", "Lỗi !", "Kết nối không ổn định. Vui lòng thử lại.", "top-end");
                    return;
                }

                const data = await response.json();

                localStorage.setItem("user", JSON.stringify(data));
                console.log("Authentication successful");

                // Chuyển hướng người dùng sau khi đăng nhập thành công
                window.location.href = "/";
            } catch (error) {
                console.error("Error sending code to backend:", error);
                // Handle error if needed
            }
        };

        if (code) {
            sendCodeToBackend();
        }
    }, [navigate]);

    return (
        <div className="form">
            <HeaderLoginForm title="Đăng nhập" />
            <div className="login-form" id="Login-form">
                <div className="login-left">
                    <img src="asserts/img/logo-cau-long-dep-01.png" alt="Logo" />
                </div>
                <div className="login-right">
                    <form onSubmit={login}>
                        <div className="input-box">
                            <input
                                type="text"
                                name="email"
                                className="form-control"
                                placeholder="Email"
                                id="email"
                                value={email}
                                onChange={setParams}
                            />
                            <i className="fa-solid fa-user" />
                        </div>
                        {emailError && <p className="text-danger">{emailError}</p>}
                        <div className="input-box">
                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                placeholder="Mật khẩu"
                                id="password"
                                value={password}
                                onChange={setParams}
                            />
                            <i className="fa-solid fa-lock" />
                        </div>
                        {passwordError && <p className="text-danger">{passwordError}</p>}
                        <div className="remember-forgot">
                            <a href="/forgot-password">Quên mật khẩu</a>
                        </div>
                        <div>
                            <button className="btn btn-primary p-2" type="submit">
                                Đăng nhập
                            </button>
                        </div>
                        <div className="divider">
                            <span>hoặc tiếp tục với</span>
                        </div>
                        <div className="login-with">
                            <div className="gmail">
                                <button className="btn btn-danger p-2" onClick={handleGoogleLogin}>
                                    <i className="fa-brands fa-google" /> Google
                                </button>
                            </div>
                        </div>
                        <div className="register-link">
                            <p>
                                Bạn chưa có tài khoản? <Link to="/register">Đăng ký</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Login;
