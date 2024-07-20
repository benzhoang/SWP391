import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import HeaderLoginForm from "../../components/header-login-form";
import Footer from "../../components/footer";
import "./index.css";
import "../../App.css";
import "sweetalert2/dist/sweetalert2.css";
import { showAlert } from "../../utils/alertUtils";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [rePasswordError, setRePasswordError] = useState("");
    const [fullNameError, setFullNameError] = useState("");

    const navigate = useNavigate();

    const setParams = (event) => {
        if (event.target.name === "email") {
            setEmail(event.target.value);
        } else if (event.target.name === "password") {
            setPassword(event.target.value);
        } else if (event.target.name === "rePassword") {
            setRePassword(event.target.value);
        } else if (event.target.name === "fullName") {
            setFullName(event.target.value);
        }
    };

    const register = (event) => {
        event.preventDefault();

        // Reset previous error messages
        setEmailError("");
        setPasswordError("");
        setRePasswordError("");
        setFullNameError("");

        // Email validation
        if (!email.trim()) {
            setEmailError("Email không được để trống");
            return;
        }

        if (!email.endsWith("@gmail.com")) {
            setEmailError("Email phải có đuôi là @gmail.com");
            return;
        }

        if (email.length > 100) {
            setEmailError("Email không được vượt quá 100 ký tự");
            return;
        }

        // FullName validation
        if (!fullName.trim()) {
            setFullNameError("Họ và tên không được để trống");
            return;
        }

        if (fullName.length > 100) {
            setFullNameError("Họ và tên không được vượt quá 100 ký tự");
            return;
        }

        // Password validation
        if (!password.trim()) {
            setPasswordError("Mật khẩu không được để trống");
            return;
        }

        if (password.length < 8 || password.length > 120) {
            setPasswordError("Mật khẩu phải có từ 8 đến 120 ký tự");
            return;
        }

        if (!rePassword.trim()) {
            setRePasswordError("Mật khẩu không được để trống");
            return;
        }

        if (rePassword.length < 8 || rePassword.length > 120) {
            setRePasswordError("Mật khẩu phải có từ 8 đến 120 ký tự");
            return;
        }

        if (password !== rePassword) {
            setRePasswordError("Mật khẩu nhập lại không khớp");
            return;
        }

        // If validations pass, proceed with login
        fetch("https://forbad.online:8443/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                password: password,
                fullName: fullName,
            }),
        })
            .then((response) => {
                if (response.status === 200) {
                    showAlert("success", "Đăng kí thành công", "Hãy đăng nhập và trải nghiệm", "top-end");
                } else {
                    response.json().then((data) => {
                        if (response.status === 400 && data.message === "Error: Email is already in use!") {
                            showAlert("error", "Đăng kí không thành công", "Email này đã có người sử dụng", "top-end");
                        } else {
                            showAlert("error", "Đăng kí không thành công", "Vui lòng thử lại !", "top-end");
                        }
                    });
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                showAlert("error", "Đăng kí không thành công", "Vui lòng thử lại !", "top-end");
            });
    };

    const handleGoogleLogin = (event) => {
        event.preventDefault();

        fetch("https://forbad.online:8443/auth/google")
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    showAlert("error", "Đăng kí không thành công", "Vui lòng thử lại !", "top-end");
                }
            })
            .then((data) => {
                if (data && data.redirectUrl) {
                    window.location.href = data.redirectUrl;
                } else {
                    showAlert("error", "Đăng kí không thành công", "Vui lòng thử lại !", "top-end");
                }
            })
            .catch((error) => {
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
                    showAlert("error", "Kết nối không ổn định", "Vui lòng thử lại !", "top-end");
                }

                const data = await response.json();
                localStorage.setItem("userId", data.userId);
                localStorage.setItem("fullName", data.fullName);
                localStorage.setItem("imageUrl", data.imageUrl);
                localStorage.setItem("role", data.role);
                localStorage.setItem("jwtToken", data.accessToken);
                localStorage.setItem("tokenExpiration", data.expirationTime);
                console.log("Authentication successful");

                // Check if the user's role is "temp"
                if (data.role === "temp") {
                    window.location.href = "/role-selector";
                } else {
                    window.location.href = "/";
                }
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
        <div className="form-register">
            <HeaderLoginForm title="Đăng kí tài khoản" />
            <div className="login-form" id="Login-form">
                <div className="login-left">
                    <img src="asserts/img/logo-cau-long-dep-01.png" alt="Logo" />
                </div>
                <div className="login-right">
                    <form onSubmit={register}>
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
                                type="text"
                                name="fullName"
                                className="form-control"
                                placeholder="Họ và tên"
                                id="fullName"
                                value={fullName}
                                onChange={setParams}
                            />
                            <i className="fa-solid fa-lock" />
                        </div>
                        {fullNameError && <p className="text-danger">{fullNameError}</p>}
                        <div>
                            <div className="row inputPass">
                                <div className="col-sm-6">
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
                                </div>
                                <div className="col-sm-6">
                                    <div className="input-box">
                                        <input
                                            type="password"
                                            name="rePassword"
                                            className="form-control"
                                            placeholder="Nhập lại mật khẩu"
                                            id="rePassword"
                                            value={rePassword}
                                            onChange={setParams}
                                        />
                                        <i className="fa-solid fa-lock" />
                                    </div>
                                    {rePasswordError && <p className="text-danger">{rePasswordError}</p>}
                                </div>
                            </div>
                            <button className="btn btn-primary p-2" type="submit">
                                Đăng ký
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
                                Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Register;
