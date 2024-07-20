import React from "react";
import "../../App.css";
import "./index.css";
const HeaderLoginForm = ({ title }) => (
    <div className="header-login-form">
        <div className="container d-flex align-items-center justify-content-between">
            <div className="header-login-form-left">
                <div className="logo-header-login">
                    <img src="asserts/img/logo-cau-long-dep-01.png" alt="Logo" />
                </div>
                <div className="name-page">
                    <p className="m-0">{title}</p>
                </div>
            </div>
            <div className="header-login-form-right m-0 w-75 text-right">
                <a href="/">
                    Trở về trang chủ <i className="fa-solid fa-arrow-right" />
                </a>
            </div>
        </div>
    </div>
);

export default HeaderLoginForm;
