import React, { Component } from "react";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import "./style.css";

export default class Rule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: false,
            user: {
                username: "",
                avatar: "",
                email: "",
                password: "",
                phone: "",
                balance: 0,
                roles: [],
            },
            errors: {
                email: "",
                password: "",
                phone: "",
            },
        };
    }
    componentDidMount() {
        const user = JSON.parse(localStorage.getItem("user"));

        if (user) {
            this.setState({
                isLoggedIn: true,
                user: {
                    username: user.fullName,
                    avatar: user.imageUrl,
                    email: user.email,
                    phone: user.phone,
                    balance: user.balance,
                    roles: user.roles,
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
                email: "",
                password: "",
                phone: "",
                balance: 0,
                roles: [],
            },
        });

        window.location.href = "/";
    };
    render() {
        const { isLoggedIn, user, errors } = this.state;
        return (
            <div className="rules">
                <Header isLoggedIn={isLoggedIn} user={user} handleLogout={this.handleLogout} />
                <div className="rules-body">
                    <nav></nav>
                </div>
                <main>
                    <div className="container">
                        <section id="general">
                            <h2>1. Quy Định Chung</h2>
                            <p>
                                1. <strong>Tuân Thủ Pháp Luật:</strong> Người dùng phải tuân thủ tất cả các quy định pháp luật hiện hành khi sử dụng
                                dịch vụ đặt sân cầu lông.
                            </p>
                            <p>
                                2. <strong>Thông Tin Chính Xác:</strong> Người dùng phải cung cấp thông tin chính xác và đầy đủ khi đăng ký tài khoản
                                và đặt sân.
                            </p>
                            <p>
                                3. <strong>Bảo Mật Tài Khoản:</strong> Người dùng có trách nhiệm bảo mật thông tin tài khoản của mình. Không chia sẻ
                                mật khẩu với người khác.
                            </p>
                        </section>

                        <section id="booking">
                            <h2>2. Quy Định Đặt Sân</h2>
                            <p>
                                1. <strong>Thời Gian Đặt Sân:</strong> Người dùng có thể đặt sân trước tối thiểu 1 giờ và tối đa 30 ngày. Các khung
                                giờ đặt sân phải tuân theo lịch trình hoạt động của sân cầu lông.
                            </p>
                            <p>
                                2. <strong>Xác Nhận Đặt Sân:</strong> Sau khi đặt sân thành công, hệ thống sẽ gửi email hoặc tin nhắn xác nhận. Người
                                dùng phải mang theo mã xác nhận khi đến sân để kiểm tra và vào sân.
                            </p>
                            <p>
                                3. <strong>Hủy Đơn Đặt Sân:</strong> Người dùng có thể hủy đơn đặt sân trước giờ bắt đầu ít nhất 24 giờ. Phí hủy đơn
                                sẽ được áp dụng theo quy định của sân cầu lông.
                            </p>
                        </section>

                        <section id="payment">
                            <h2>3. Quy Định Về Thanh Toán</h2>
                            <p>
                                1. <strong>Phương Thức Thanh Toán:</strong> Hỗ trợ thanh toán qua các phương thức: thẻ tín dụng, thẻ ghi nợ, PayPal,
                                và các ví điện tử. Thanh toán phải được thực hiện ngay khi đặt sân để đảm bảo giữ chỗ.
                            </p>
                            <p>
                                2. <strong>Hoàn Tiền:</strong> Hoàn tiền chỉ áp dụng cho các đơn hủy trước 24 giờ. Phí dịch vụ có thể không được hoàn
                                trả.
                            </p>
                        </section>

                        <section id="usage">
                            <h2>4. Quy Định Sử Dụng Sân</h2>
                            <p>
                                1. <strong>Giữ Vệ Sinh:</strong> Người dùng phải giữ vệ sinh chung, không vứt rác bừa bãi trong khu vực sân. Sử dụng
                                trang phục và giày dép thích hợp khi chơi cầu lông.
                            </p>
                            <p>
                                2. <strong>Tránh Gây Ồn Ào:</strong> Không gây ồn ào, ảnh hưởng đến các người chơi khác và cư dân xung quanh.
                            </p>
                            <p>
                                3. <strong>Bảo Quản Tài Sản:</strong> Người dùng phải bảo quản tài sản cá nhân và trang thiết bị của sân. Nếu gây hư
                                hỏng thiết bị, người dùng phải chịu trách nhiệm bồi thường.
                            </p>
                        </section>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }
}
