import Footer from '../../components/footer/index.jsx';
import '../forgot-password/index.css';
import HeaderLoginForm from "../../components/header-login-form/index.jsx";
import { useState } from 'react';
import { showAlert } from '../../utils/alertUtils'; 

const TokenResetPassword = () => {
    const [token, setToken] = useState("");
    const [tokenError, setTokenError] = useState("");

    const setParams = (event) => {
        if (event.target.name === "token") {
            setToken(event.target.value);
        } 
    };

    const token_verify = (event) => {
        event.preventDefault();

        // Reset previous error messages
        setTokenError("");

        // Email validation
        if (!token.trim()) {
            setTokenError("Token không được để trống");
            return;
        }

        if (token.length > 6) {
            setTokenError("Token không được vượt quá 6 ký tự");
            return;
        }

        // If validations pass, proceed with login
        fetch(`http://167.99.67.127:8080/forgot-password/verify-token?token=${token}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: token,
            }),
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    showAlert('error', 'Lỗi', 'Có lỗi xảy ra, xin hãy thử lại !', 'top-end');
                }
            })
            .then((data) => {
                localStorage.setItem("userId", data.userId);
                window.location.href="/reset-password";
            })
            .catch((error) => {
                console.error(error);
            });
    };

    return (
        <div className="form">
            <HeaderLoginForm title="Xác thực mã xác nhận" />
            <div className="login-form" id="Login-form">
                <div className="login-left">
                    <img src="asserts/img/logo-cau-long-dep-01.png" alt="Logo" />
                </div>
                <div className="login-right">
                    <h5>Vui lòng nhập mã xác nhận đã được gửi về email của bạn</h5>
                    <form onSubmit={token_verify}>
                        <div className="input-box">
                            <input
                                type="text"
                                name="token"
                                className="form-control"
                                placeholder="Mã xác nhận"
                                id="token"
                                value={token}
                                onChange={setParams}
                            />
                        </div>
                        {tokenError && (
                            <p className="text-danger">{tokenError}</p>
                        )}
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

export default TokenResetPassword;
