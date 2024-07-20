import React, { Component } from "react";
import "./style.css";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { Link } from "react-router-dom";
import { avatar } from "../../../assets/images/download (user).jpg";
export default class GioiThieu extends Component {
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
            <div>
                <Header isLoggedIn={isLoggedIn} user={user} handleLogout={this.handleLogout} />
                <div className="aboutUs">
                    <section className="aboutUs-story">
                        <div className="container">
                            <div className="aboutUs-story-title">
                                <h3>Giới thiệu</h3>
                                <h2>Một số điều về ForBadminton</h2>
                            </div>
                            <div className="form-aboutUs row">
                                <div className="aboutUs-story-left col-lg-6">
                                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnBQikXnWyLEnOM7x6Cb9i8ogBo7KafAumOA&s" />
                                </div>
                                <div className="aboutUs-story-right col-lg-6">
                                    <h2>Chúng tôi đã tìm thấy không gian mới lạ dành cho bạn.</h2>
                                    <p>
                                        Bạn có đam mê cầu lông và đang tìm kiếm một địa điểm để thỏa sức tung hoành? 4BaD chính là sự lựa chọn hoàn
                                        hảo dành cho bạn. Chúng tôi tự hào là nền tảng đặt sân cầu lông hàng đầu, cung cấp các dịch vụ tiện ích và
                                        chất lượng nhằm mang đến trải nghiệm tuyệt vời cho mọi người chơi.
                                    </p>
                                    <p>
                                        Với mong muốn mang lại cho khách hàng một phương thức đặt sân mới lạ, tiện lợi cho những người yêu thích thể
                                        thao.
                                    </p>
                                    <button>
                                        <Link to="/">Trải nghiệm ngay</Link>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="container">
                            <div className="we-do row">
                                <div className="we-do-title col-lg-3 col-md-6">
                                    <h2>Tại sao lại chọn 4BaD?</h2>
                                </div>
                                <div className="we-do-title col-lg-3 col-md-6">
                                    <h2>Đa dạng sân bãi</h2>
                                    <p>Liên kết được nhiều sân bãi uy tín, trải rộng khắp khu vực.</p>
                                </div>
                                <div className="we-do-title col-lg-3 col-md-6">
                                    <h2>Đặt sân dễ dàng</h2>
                                    <p>Giao diện thân thiện, dễ dàng tìm kiếm và đặt sân chỉ trong vài phút.</p>
                                </div>
                                <div className="we-do-title col-lg-3 col-md-6">
                                    <h2>Giá cả cạnh tranh</h2>
                                    <p>Giá cả công khai, và nhiều chương trình khuyến mãi dành cho khách hàng thân thiết</p>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* skills */}
                    <section className="skill">
                        <div className="container">
                            <div className="row">
                                <div className="skill-left col-lg-6">
                                    <h3>Tự đánh giá</h3>
                                    <h2>
                                        Một số điểm nổi bật
                                        <br />
                                        mà trang web mang lại
                                    </h2>
                                    <p>Chúng tôi tự hào mang đến cho bạn những tính năng ưu việt và trải nghiệm tuyệt vời nhất.</p>
                                    <div className="progress-item">
                                        <h3>Độ tin cậy</h3>
                                        <div className="progress" style={{ height: 7 }}>
                                            <div className="progress-bar" style={{ width: "80%" }} />
                                        </div>
                                    </div>
                                    <div className="progress-item">
                                        <h3>Giao diện thân thiện</h3>
                                        <div className="progress" style={{ height: 7 }}>
                                            <div className="progress-bar" style={{ width: "95%" }} />
                                        </div>
                                    </div>
                                    <div className="progress-item">
                                        <h3>Dịch vụ khách hàng</h3>
                                        <div className="progress" style={{ height: 7 }}>
                                            <div className="progress-bar" style={{ width: "90%" }} />
                                        </div>
                                    </div>
                                    <div className="progress-item">
                                        <h3>Giá cả cạnh tranh</h3>
                                        <div className="progress" style={{ height: 7 }}>
                                            <div className="progress-bar" style={{ width: "85%" }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="skill-right col-lg-6 ">
                                    <div className="skill-right-img ">
                                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWj2LjwKy8Akf86CZ_QRwmnsRGYtQTxv2nkw&s" alt />
                                    </div>
                                    <div className="skill-right-img ">
                                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9JYfZ0hqiXCg20_39M2PHg6fz5cEarERr3g&s" alt />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* cheft */}
                    <section className="chefs">
                        <div className="container">
                            <div className="chefs-title">
                                <h3>Nhóm chúng tôi</h3>
                                <h2>Các thành viên</h2>
                            </div>
                            <div className="chef-list row">
                                <div className="chef-item col-lg-4 col-md-6">
                                    <div className="chef-img">
                                        <img
                                            src="data:image/png;base64,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"
                                            alt="Avatar"
                                        />
                                        <div className="chef-contact">
                                            <Link to="https://www.facebook.com/">
                                                <i className="fa-brands fa-facebook-f" />
                                            </Link>
                                            <Link to="https://twitter.com/i/flow/login">
                                                <i className="fa-brands fa-twitter" />
                                            </Link>
                                            <Link to="https://www.instagram.com/accounts/login/?hl=en">
                                                <i className="fa-brands fa-instagram" />
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="chef-name">
                                        <h3>Nguyễn Vân A</h3>
                                        <p>Admin</p>
                                    </div>
                                </div>
                                <div className="chef-item col-lg-4 col-md-6">
                                    <div className="chef-img">
                                        <img
                                            src="data:image/png;base64,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"
                                            alt
                                        />
                                        <div className="chef-contact">
                                            <a href="https://www.facebook.com/">
                                                <i className="fa-brands fa-facebook-f" />
                                            </a>
                                            <a href="https://twitter.com/i/flow/login">
                                                <i className="fa-brands fa-twitter" />
                                            </a>
                                            <a href="https://www.instagram.com/accounts/login/?hl=en">
                                                <i className="fa-brands fa-instagram" />
                                            </a>
                                        </div>
                                    </div>
                                    <div className="chef-name">
                                        <h3>Huỳnh Thị A</h3>
                                        <p>Admin</p>
                                    </div>
                                </div>
                                <div className="chef-item col-lg-4 col-md-6 col-sm-12">
                                    <div className="chef-img">
                                        <img
                                            src="data:image/png;base64,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"
                                            alt
                                        />
                                        <div className="chef-contact">
                                            <a href="https://www.facebook.com/">
                                                <i className="fa-brands fa-facebook-f" />
                                            </a>
                                            <a href="https://twitter.com/i/flow/login">
                                                <i className="fa-brands fa-twitter" />
                                            </a>
                                            <a href="https://www.instagram.com/accounts/login/?hl=en">
                                                <i className="fa-brands fa-instagram" />
                                            </a>
                                        </div>
                                    </div>
                                    <div className="chef-name">
                                        <h3>Trương Văn A</h3>
                                        <p>Admin</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                <Footer />
            </div>
        );
    }
}
