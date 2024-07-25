import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Header from "../../../components/header/index";
import Footer from "../../../components/footer";
import SelectCourt from "./SelectedCourt";
import NapGio from "./formBooking/NapGio";
import Slot from "./formBooking/Slot";
import "../bookingPage/booking.css";
import CardYard from "../../../components/CardYard";
import Feedback from "../bookingPage/feedback/feedback";
import { useLocation } from "react-router-dom";
import axiosInstance from "../../../config/axiosConfig";
import { showAlert } from "../../../utils/alertUtils";

const generateDummyData = (num) => {
    return Array.from({ length: num }, (_, index) => ({
        courtId: `dummy-${index}`,
        name: `Sân Cầu Lông ${index + 1}`,
        location: `Địa chỉ ${index + 1}`,
        // Thêm các thuộc tính khác tùy theo cấu trúc dữ liệu thực tế của bạn
    }));
};

export default function Booking() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState({
        username: "",
        avatar: "",
        roles: [],
    });

    const [latestCourts, setLatestCourts] = useState([]);

    const location = useLocation();
    const { court } = location.state || {};

    useEffect(() => {
        window.scrollTo(0, 0);
        const user = JSON.parse(localStorage.getItem("user"));

        if (user) {
            setIsLoggedIn(true);
            setUser({
                username: user.fullName,
                avatar: user.imageUrl,
                roles: user.roles,
            });
        }

        axiosInstance
            .get("/court/latest-courts")
            .then((response) => {
                const latest = response.data.length ? response.data : generateDummyData(20);
                setLatestCourts(latest);
            })
            .catch((error) => {
                console.error("There was an error fetching!", error);
                setLatestCourts(generateDummyData(20)); // Sử dụng dữ liệu giả lập nếu có lỗi
            });
    }, []);

    const settings = {
        dots: true,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 3000,
        speed: 300,
        slidesToShow: 4,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    infinite: true,
                    dots: true,
                },
            },
            {
                breakpoint: 850,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    infinite: true,
                    dots: true,
                },
            },
            {
                breakpoint: 400,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true,
                },
            },
        ],
    };

    const handleLogout = () => {
        localStorage.removeItem("user");

        setIsLoggedIn(false);
        setUser({
            username: "",
            avatar: "",
            roles: [],
        });

        window.location.href = "/";
    };

    if (!court || !court.imageUrl) {
        return <div>Đang tải....</div>; // Hoặc có thể thay đổi xử lý tùy vào yêu cầu của bạn
    }

    return (
        <div className="bookingPage">
            <Header isLoggedIn={isLoggedIn} user={user} handleLogout={handleLogout} />
            <SelectCourt court={court} />
            <section className="form-booking">
                <div className="booking row">
                    {/* <div className="col-lg-4">
                        <NapGio />
                    </div> */}
                    <div className="col-lg-12">
                        <Slot court={court} />
                    </div>
                </div>
            </section>
            <section className="newYardinBooking">
                <div className="container">
                    <h1 className="mt-5" style={{ fontSize: "40px" }}>
                        SÂN MỚI - TRẢI NGHIỆM MỚI
                    </h1>
                    <section className="yard">
                        <div className="">
                            <Slider {...settings} className="list-yard">
                                {latestCourts.slice(0, 12).map((court) => (
                                    <CardYard key={court.courtId} court={court} />
                                ))}
                            </Slider>
                        </div>
                    </section>
                </div>
            </section>
            <Footer />
        </div>
    );
}
