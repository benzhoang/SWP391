import Footer from '../../components/footer/index.jsx';
import '../forgot-password/index.css';
import HeaderLoginForm from "../../components/header-login-form/index.jsx";
import { useState } from 'react';
import { showAlert } from '../../utils/alertUtils';

const InputNewPassword = () => {
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [rePasswordError, setRePasswordError] = useState("");

    const setParams = (event) => {
        if (event.target.name === "password") {
            setPassword(event.target.value);
        } else if (event.target.name === "rePassword") {
            setRePassword(event.target.value);
        }
    };

    const new_Password = (event) => {
        event.preventDefault();

        // Reset previous error messages
        setPasswordError("");
        setRePasswordError("");

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
        fetch("http://167.99.67.127:8080/forgot-password/reset-password", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: localStorage.getItem("userId"),
                newPassword: password,
            }),
        })
            .then((response) => {
                if (response.ok) {
                    showAlert('success', 'Đổi mật khẩu thành công', 'Vui lòng đăng nhập lại.', 'top-end');
                } else {
                    showAlert('error', 'Lỗi', 'Có lỗi xảy ra, xin hãy thử lại !', 'top-end');
                }
            })
            .catch((error) => {
                console.error(error);
            });
    };

    return (
        <div className="form">
            <HeaderLoginForm title="Nhập mật khẩu mới" />
            <div className="login-form" id="Login-form">
                <div className="login-left">
                    <img src="asserts/img/logo-cau-long-dep-01.png" alt="Logo" />
                </div>
                <div className="login-right">
                    <h5>Vui lòng nhập mật khẩu mới</h5>
                    <form onSubmit={new_Password}>
                        <div className="row">
                            <div className="col-md-6">
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
                                {passwordError && (
                                    <p className="text-danger">{passwordError}</p>
                                )}
                            </div>
                            <div className="col-md-6">
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
                                {rePasswordError && (
                                    <p className="text-danger">{rePasswordError}</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <button className="btn btn-primary p-2" type="submit">
                                Xác nhận
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default InputNewPassword;
