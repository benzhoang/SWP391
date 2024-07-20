import React, { Component } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/header";
import Footer from "../../../components/footer";

export default class LienHe extends Component {
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
            <div className="lienhePage">
                <Header isLoggedIn={isLoggedIn} user={user} handleLogout={this.handleLogout} />
                <div className="" style={{ paddingTop: 100 }}>
                    <section className="introduction">
                        <h4>
                            HÃY ĐỂ ĐỘI NGŨ CHĂM SÓC KHÁCH HÀNG CỦA CHÚNG TÔI HỖ TRỢ BẠN
                            <br />Ở BẤT KÌ ĐÂU.
                        </h4>
                        <div className="intro-button">
                            <Link to="/">
                                <button>
                                    Trở về trang chủ
                                    <i className="fa-solid fa-chevron-right"></i>
                                </button>
                            </Link>

                            <button>
                                Liên hệ <i className="fa-solid fa-chevron-right" />
                            </button>
                        </div>
                        <div className="container ">
                            <div className="intro-number grid  grid-cols-2 lg:grid-cols-4 md:grid-cols-2 gap-4 sm:lg:grid-cols-2 ">
                                <div className="intro-number-item  ">
                                    <div className="intro-number-item-icon">
                                        <i class="fa-solid fa-envelope"></i>
                                    </div>
                                    <div className="intro-number-item-content">
                                        <h4>Email</h4>
                                        <p>forbadbooking@gmail.com</p>
                                    </div>
                                </div>
                                <div className="intro-number-item ">
                                    <div className="intro-number-item-icon">
                                        <i class="fa-solid fa-phone"></i>
                                    </div>
                                    <div className="intro-number-item-content">
                                        <h4>Số điện thoại</h4>
                                        <p>0123456789</p>
                                    </div>
                                </div>
                                <div className="intro-number-item ">
                                    <div className="intro-number-item-icon">
                                        <i class="fa-brands fa-facebook"></i>
                                    </div>
                                    <div className="intro-number-item-content">
                                        <h4>Facebook</h4>
                                        <p>Đặt sân trực tuyến 4Bad</p>
                                    </div>
                                </div>
                                <div className="intro-number-item ">
                                    <div className="intro-number-item-icon">
                                        <i class="fa-solid fa-building"></i>
                                    </div>
                                    <div className="intro-number-item-content">
                                        <h4>Trực tiếp</h4>
                                        <p>Hỗ trợ trực tiếp tại cơ sở</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="contact-form grid sm:grid-cols-2 gap-4 container m-auto">
                        <div className="p-3">
                            <form>
                                <p className="text-start mb-2">
                                    Chúng tôi mong muốn lắng nghe những ý kiến của quý khách. Vui lòng gửi mọi nhận xét, thắc mắc theo thông tin bên
                                    dưới
                                </p>
                                <div className="mb-3">
                                    <label className="form-label">Họ và tên</label>
                                    <input type="text" className="form-control" required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input type="email" className="form-control" required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Số điện thoại</label>
                                    <input type="text" className="form-control" required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="exampleFormControlTextarea1" className="form-label">
                                        Ghi lời nhắn cho chúng tôi
                                    </label>
                                    <textarea className="form-control" id="exampleFormControlTextarea1" rows={3} defaultValue={""} />
                                </div>

                                <button className="btn btn-primary m-0 p-2">Gửi biểu mẫu</button>
                            </form>
                        </div>
                        <div className="p-3" id="map">
                            <h3>Trụ sở của chúng tôi</h3>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.6099415304993!2d106.80730807476706!3d10.841132857997396!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2sFPT%20University%20HCMC!5e0!3m2!1sen!2s!4v1719335922052!5m2!1sen!2s"
                                height={450}
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }
}
