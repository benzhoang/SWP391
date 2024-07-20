import React, { Component } from "react";
import logo from "../../assets/images/forbad_logo.png";
import "../footer/index.css";
import "../../App.css";

export default class Footer extends Component {
    render() {
        return (
            <div>
                <section className="footer">
                    <div className="container">
                        <div className="row">
                            <div className="dinner col-lg-4 col-md-6">
                                <img src={logo} alt="Logo" />

                                <p className="mb-3">
                                    Hãy liên hệ với chúng tôi để biết thêm thông tin và đặt sân ngay hôm nay. Chúng tôi rất hân hạnh được đón tiếp
                                    bạn!
                                </p>
                                <div className="social-media">
                                    <a href="https://www.facebook.com/">
                                        <i className="fa-brands fa-facebook-f" />
                                    </a>
                                    <a href="https://twitter.com/i/flow/login">
                                        <i className="fa-brands fa-twitter" />
                                    </a>
                                    <a href="https://www.instagram.com/accounts/login/?hl=en">
                                        <i className="fa-brands fa-instagram" />
                                    </a>
                                    <a href="https://vn.linkedin.com/">
                                        <i className="fa-brands fa-linkedin-in" />
                                    </a>
                                </div>
                            </div>
                            <div className="infomation-contact col-lg-4 col-md-6 col-sm-12" style={{ lineHeight: "40px" }}>
                                <h2>Liên hệ</h2>
                                <p>
                                    <i className="fa-solid fa-phone" />
                                    0123456789
                                </p>
                                <p>
                                    <i className="fa-solid fa-envelope" /> forbadbooking@gmail.com
                                </p>
                                <p>
                                    <i class="fa-solid fa-house"></i>Lô E2a-7, Đường D1, Đ. D1, Long Thạnh Mỹ, Thành Phố Thủ Đức, Hồ Chí Minh 700000
                                </p>
                            </div>
                            <div className="contact col-lg-4 col-md-12">
                                <h2>Trụ sở</h2>
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.6100105370124!2d106.80730807480579!3d10.841127589311634!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2sFPT%20University%20HCMC!5e0!3m2!1sen!2s!4v1719592934424!5m2!1sen!2s"
                                    style={{ border: 0 }}
                                    className="w-100 h-75"
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </div>
                        </div>
                        <br />
                        <hr />
                        <br />
                        <p>© Tháng 5 2024 - Babminton Court Managerment System Team 4 - SWP391</p>
                    </div>
                </section>
            </div>
        );
    }
}
