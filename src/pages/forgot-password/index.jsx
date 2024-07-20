import Footer from "../../components/footer/index.jsx";
import "../forgot-password/index.css";
import HeaderLoginForm from "../../components/header-login-form/index.jsx";
import { useState } from "react";
import { showAlert } from "../../utils/alertUtils";
import "../login/index.css";
const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    const setParams = (event) => {
        if (event.target.name === "email") {
            setEmail(event.target.value);
        }
    };

    const email_verify = (event) => {
        event.preventDefault();

        // Reset previous error messages
        setEmailError("");

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

        // If validations pass, proceed with login
        fetch("http://167.99.67.127:8080/forgot-password/email-verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
            }),
        })
            .then((response) => {
                if (response.ok) {
                    window.location.href = "/verify-token";
                } else {
                    response.json().then((data) => {
                        if (response.status === 401 && data.message === "Người dùng không tồn tại.") {
                            showAlert("error", "Lỗi", "Email này không tồn tại trong hệ thống", "top-end");
                        } else {
                            showAlert("error", "Lỗi", "Vui lòng thử lại !", "top-end");
                        }
                    });
                }
            })
            .catch((error) => {
                console.error(error);
            });
    };

    return (
        <div className="form-forgotPass">
            <HeaderLoginForm title="Quên mật khẩu" />
            <div className="login-form" id="Login-form">
                <div className="login-left">
                    <img src="asserts/img/logo-cau-long-dep-01.png" alt="Logo" />
                </div>
                <div className="login-right">
                    <h5>Vui lòng nhập email để nhận mã xác nhận</h5>
                    <form onSubmit={email_verify}>
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
                        <div>
                            <button className="btn btn-primary p-2" type="submit">
                                Tiếp tục
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ForgotPassword;
