import React, { useEffect, useState } from "react";
import Header from "../../../../components/header";
import Footer from "../../../../components/footer";
import "./index.css";
import axiosInstance from "../../../../config/axiosConfig";
import { alert, showConfirmAlert, showConfirmPayment } from "../../../../utils/alertUtils";
import axios from "axios";
import { Link } from "react-router-dom";
import Spinner from "../../../../components/snipper";
const DetailBooking = () => {
    const [booking, setBooking] = useState(null);
    const [bookingDetailsList, setBookingDetailsList] = useState([]);
    const [paymentUrl, setPaymentUrl] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    const [user, setUser] = useState({
        username: "",
        avatar: "",
        roles: [],
    });

    const [isPaypalSelected, setIsPaypalSelected] = useState(false);

    const goBack = () => {
        window.history.back();
    };

    const handlePaymentSuccess = async () => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const paymentId = urlParams.get("paymentId");
            const PayerID = urlParams.get("PayerID");
            const bookingData = JSON.parse(localStorage.getItem("booking"));

            if (!paymentId || !PayerID) {
                throw new Error("Missing paymentId or PayerID");
            }

            setLoading(true);
            const response = await axiosInstance.get(`/paypal/success?paymentId=${paymentId}&PayerID=${PayerID}`);

            if (response.data && response.data.id) {
                const paymentId = response.data.id;

                const bookingResponse = await axiosInstance.post(`/booking/success/${paymentId}`, bookingData);
                setLoading(false);
                if (bookingResponse.data.message === "Đã đặt lịch thành công.") {
                    showConfirmPayment(
                        "Thông báo",
                        "Thanh toán và đặt lịch thành công !",
                        "success",
                        "Xem trạng thái đơn hàng",
                        "Trở về trang chủ",
                        "center"
                    ).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = "/historyOrder";
                        } else if (result.dismiss) {
                            window.location.href = "/";
                        }
                    });
                } else {
                    handlePaymentCanceled();
                }
            } else {
                throw new Error("Payment failed");
            }
        } catch (error) {
            console.error("Failed to process payment success:", error);
        }
    };

    const handlePaymentCanceled = () => {
        showConfirmPayment("Thông báo", "Thanh toán thất bại !", "error", "Trở về trang đặt hàng", "Trở về trang chủ", "center").then((result) => {
            if (result.isConfirmed) {
                window.history.back();
            } else if (result.dismiss) {
                window.location.href = "/";
            }
        });
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));

        if (user) {
            setIsLoggedIn(true);
            setUser({
                username: user.fullName,
                avatar: user.imageUrl,
                roles: user.roles,
            });
        }

        const bookingData = JSON.parse(localStorage.getItem("booking"));
        setBooking(bookingData);
        setBookingDetailsList(bookingData.bookingDetails);

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has("paymentId") && urlParams.has("PayerID")) {
            handlePaymentSuccess();
        } else if (urlParams.has("cancel")) {
            handlePaymentCanceled();
        }
    }, []);

    if (!booking) {
        return <div>Loading...</div>;
    }

    const getExchangeRate = async () => {
        const API_KEY = "a2ebea95ae9c3ce5ae387b15";
        const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

        try {      
            const response = await axios.get(BASE_URL);
            if (response.status === 200) {
                const exchangeRates = response.data.conversion_rates;
                // Lấy tỷ giá VND
                const exchangeRateVND = exchangeRates.VND;
                return exchangeRateVND;
            } else {
                console.error("Failed to fetch exchange rates:", response.statusText);
                return null;
            }
        } catch (error) {
            console.error("Error fetching exchange rates:", error);
            return null;
        }
    };

    const initiatePayment = async () => {
        try {
            // Lấy tỷ giá từ VND sang USD
            setLoading(true);
            const exchangeRate = await getExchangeRate();
            if (!exchangeRate) {
                throw new Error("Failed to get exchange rate");
            }

            const totalPriceUSD = booking.totalPrice / exchangeRate;

            const response = await axiosInstance.post("/paypal/create-payment", {
                total: totalPriceUSD,
                currency: "USD",
                description: "Payment via PayPal",
                cancelUrl: "https://forbad.online/detailBooking",
                successUrl: "https://forbad.online/detailBooking",
            });

            setLoading(false);
            if (response.status === 200 && response.data.length > 0) {
                setPaymentUrl(response.data);
                window.location.href = response.data;
            } else {
                alert('error', 'Thông báp', 'Đặt lịch không thành công !', 'top-end');
                throw new Error(`Unexpected response status: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Failed to initiate payment:", error);
            handlePaymentCanceled();
        }
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
    const totalPages = booking.bookingType !== "Lịch linh hoạt" ? Math.ceil(bookingDetailsList.length / itemsPerPage) : 0;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems =
        booking.bookingType !== "Lịch linh hoạt"
            ? bookingDetailsList
                .sort((a, b) => a.yardSchedule.slot.slotName.localeCompare(b.yardSchedule.slot.slotName))
                .slice(indexOfFirstItem, indexOfLastItem)
            : [];

    const handleClick = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="orderDetailPage">
            <Header isLoggedIn={isLoggedIn} user={user} handleLogout={handleLogout} />
            <div className="fromOrder container">
                {loading && <Spinner />}
                <div className="detailOrder row">
                    <div className="col-md-7 col-sm-12 info-order ">
                        <h4>Chi tiết đơn hàng</h4>
                        <div className="mb-1 row ">
                            <label htmlFor="nameYard" className="col-sm-5 col-form-label">
                                Ngày tạo đơn:
                            </label>
                            <div className="col-sm-7 d-flex " style={{ alignItems: "center" }}>
                                <div className="create-day me-4">{booking.bookingDate}</div>
                            </div>
                        </div>
                        <div className="mb-1">
                            <div className="id-order d-flex">
                                <label htmlFor="" className="col-sm-5 col-form-label">
                                    Mã đơn hàng:
                                </label>
                                <p className="col-sm-7 ms-2" style={{ display: "flex", alignItems: "center" }}>
                                    {booking.bookingId}
                                </p>
                            </div>
                        </div>
                        <div className="mb-1 row ">
                            <label htmlFor="nameYard" className="col-sm-5 col-form-label">
                                Khách hàng:
                            </label>
                            <div className="col-sm-7 " style={{ display: "flex", alignItems: "center" }}>
                                <p className="">{booking.customer.fullName}</p>
                            </div>
                        </div>

                        <div className="mb-1 row ">
                            <label htmlFor="nameYard" className="col-sm-5 col-form-label">
                                Email:
                            </label>
                            <div className="col-sm-7 " style={{ display: "flex", alignItems: "center" }}>
                                <p className="">{booking.customer.email}</p>
                            </div>
                        </div>

                        <div className="mb-1 row ">
                            <label htmlFor="" className="col-sm-5 col-form-label">
                                Dạng lịch:
                            </label>
                            <div className="col-sm-7 " style={{ display: "flex", alignItems: "center" }}>
                                <p>{booking.bookingType}</p>
                            </div>
                        </div>
                        {booking.bookingType !== "Lịch linh hoạt" ? (
                            <div className="mb-1 infoOfBooking mt-3 py-2">
                                <table className="table table-borderless">
                                    <thead>
                                        <tr>
                                            <th>Slot</th>
                                            <th>Ngày check-in</th>
                                            <th>Sân</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map((bookingDetail, index) => (
                                            <tr key={index}>
                                                <td>{bookingDetail.yardSchedule.slot.slotName}</td>
                                                <td>{bookingDetail.date}</td>
                                                <td>{bookingDetail.yardSchedule.yard.yardName}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {booking.bookingType !== "Lịch linh hoạt" && totalPages > 1 && (
                                    <nav aria-label="Page navigation example">
                                        <ul className="pagination">
                                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                                <a className="page-link" href="#" aria-label="Previous" onClick={() => handleClick(currentPage - 1)}>
                                                    <span aria-hidden="true">&laquo;</span>
                                                </a>
                                            </li>
                                            {Array.from({ length: totalPages }, (_, index) => (
                                                <li key={index} className={`page-item ${currentPage === index + 1 ? "active" : ""}`}>
                                                    <Link
                                                        to="#"
                                                        className="page-link"
                                                        onClick={() => handleClick(index + 1)}
                                                    // style={{
                                                    //     color: "white",
                                                    //     backgroundColor: currentPage === index + 1 ? "aquamarine" : "#002e86",
                                                    // }}
                                                    >
                                                        {index + 1}
                                                    </Link>
                                                </li>
                                            ))}
                                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                                <Link className="page-link" to="#" aria-label="Next" onClick={() => handleClick(currentPage + 1)}>
                                                    <span aria-hidden="true">&raquo;</span>
                                                </Link>
                                            </li>
                                        </ul>
                                    </nav>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="mb-1 row ">
                                    <label htmlFor="" className="col-sm-5 col-form-label">
                                        Tổng số giờ đăng ký:
                                    </label>
                                    <div className="col-sm-7 " style={{ display: "flex", alignItems: "center" }}>
                                        <p>{booking.flexibleBooking.availableHours}</p>
                                    </div>
                                </div>
                                <div className="mb-1 row ">
                                    <label htmlFor="" className="col-sm-5 col-form-label">
                                        Ngày hết hạn:
                                    </label>
                                    <div className="col-sm-7 " style={{ display: "flex", alignItems: "center" }}>
                                        <p>{booking.flexibleBooking.expirationDate}</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="col-md-4 col-sm-12 info-customer">
                        <h4>Thanh toán</h4>
                        <div className="mb-1 row ">
                            <label htmlFor="" className="col-sm-6 col-form-label" style={{ fontSize: "18px" }}>
                                <i class="fa-solid fa-money-bill"></i> Tổng tiền:
                            </label>
                            <div className="col-sm-6 " style={{ display: "flex", alignItems: "center" }}>
                                <strong style={{ fontSize: "22px", color: "orangered", display: "flex", alignItems: "center" }}>
                                    {booking.totalPrice.toLocaleString("vi-VN")} VND
                                </strong>
                            </div>
                        </div>
                        <div className="mb-1 row ">
                            <label htmlFor="" className="col-sm-6 col-form-label" style={{ fontSize: "17px" }}>
                                Thanh toán bằng
                            </label>
                            <div className="col-sm-6 pay mb-5" style={{ display: "flex", alignItems: "center" }}>
                                <input type="radio" onChange={() => setIsPaypalSelected(true)}></input>
                                <label className="d-flex ms-3" style={{ display: "flex", alignItems: "center" }}>
                                    <i class="fa-brands fa-paypal"></i>
                                    <p>Paypal</p>
                                </label>
                            </div>
                            <button
                                type="button"
                                className="btn btn-primary m-0 p-2"
                                style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                                onClick={initiatePayment}
                                disabled={!isPaypalSelected}
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
                <div className="button-function d-flex w-50 m-auto pb-4 mt-4">
                    <button className="btn btn-danger py-2 w-50 m-auto" onClick={goBack}>
                        Trở về trang đặt sân
                    </button>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default DetailBooking;
