import React, { useCallback, useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import axiosInstance from "../../../../config/axiosConfig";
import { alert, showConfirmPayment } from "../../../../utils/alertUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCheckCircle, faTimesCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "./orderItem.css";
import Spinner from "../../../../components/snipper";

const OrderItem = ({ booking, onBookingCancel }) => {
    const [showModal, setShowModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {}, [booking]);

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

    const handleCancelBooking = async (booking) => {
        try {
            showConfirmPayment("Thông báo", "Bạn có chắc chắn muốn hủy đơn hàng ?", "warning", "Chắc chắn rồi", "Trở lại", "center").then(
                async (result) => {
                    if (result.isConfirmed) {
                        if (booking && booking.bookingType === "Lịch linh hoạt") {
                            const bookingId = booking?.bookingId;

                            setLoading(true);
                            const cancelResponse = await axiosInstance.post(`/booking/${bookingId}/cancel`);
                            setLoading(false);
                            if (cancelResponse.data.message === "Đã hủy đơn hàng thành công.") {
                                alert(
                                    "success",
                                    "Thông báo",
                                    "Hủy đơn hàng thành công ! Số giờ linh hoạt đã được hoàn vào tài khoản của bạn.",
                                    "center"
                                );
                                onBookingCancel();
                                return;
                            } else {
                                alert("error", "Thông báo", "Hủy đơn hàng không thành công !", "center");
                                return;
                            }
                        }

                        const exchangeRate = await getExchangeRate();
                        if (!exchangeRate) {
                            throw new Error("Failed to get exchange rate");
                        }

                        const saleId = booking?.payment?.saleId;

                        const refundAmount = booking?.payment?.paymentAmount / exchangeRate;

                        setLoading(true);
                        const refundResponse = await axiosInstance.post(`/paypal/refund/${saleId}/${refundAmount}`);

                        if (refundResponse.data.message === "Refund successful") {
                            const bookingId = booking?.bookingId;

                            const cancelResponse = await axiosInstance.post(`/booking/${bookingId}/cancel`);
                            setLoading(false);
                            if (cancelResponse.data.message === "Đã hủy đơn hàng thành công.") {
                                alert(
                                    "success",
                                    "Thông báo",
                                    "Hủy đơn hàng thành công ! Số tiền đã được hoàn trả vào tài khoản Paypal của bạn.",
                                    "center"
                                );
                                onBookingCancel();
                            } else {
                                alert("error", "Thông báo", "Hủy đơn hàng không thành công !", "center");
                            }
                        }
                    }
                }
            );
        } catch (error) {
            console.error("Failed to cancel booking:", error);
        }
    };

    if (!booking.court) {
        return <div>Đang tải...</div>;
    }

    function getStatusTextColor(status) {
        switch (status) {
            case "Đang chờ xử lý":
                return "#FFA500"; // Màu cam
            case "Đang chờ check-in":
                return "#0000FF"; // Màu xanh dương
            case "Đã hoàn thành":
                return "#008000"; // Màu xanh lá cây
            case "Đã hủy":
                return "#FF0000"; // Màu đỏ
            case "Đã thanh toán":
                return "#008000";
            case "Đã hoàn tiền":
                return "#FFA500";
            default:
                return "#000"; // Màu mặc định
        }
    }

    function getIconForStatus(status) {
        switch (status) {
            case "Đang chờ xử lý":
                return <FontAwesomeIcon icon={faSpinner} className="text-warning" />;
            case "Đang chờ check-in":
                return <FontAwesomeIcon icon={faClock} className="text-info" />;
            case "Đã hoàn thành":
                return <FontAwesomeIcon icon={faCheckCircle} className="text-success" />;
            case "Đã hủy":
                return <FontAwesomeIcon icon={faTimesCircle} className="text-danger" />;
            default:
                return null;
        }
    }

    return (
        <div className="orderItemList">
            {loading && <Spinner />}
            <div className="orderItem mt-4" style={{ boxShadow: " rgba(0, 0, 0, 0.24) 0px 3px 8px", borderRadius: 10 }}>
                <div className="orderItem-header">
                    <div className="nameCourt">
                        <h5>{booking.court.courtName}</h5>
                    </div>
                    <div className="status d-flex">
                        <i>{getIconForStatus(booking.statusEnum)}</i>
                        <span style={{ color: getStatusTextColor(booking.statusEnum) }}>{booking.statusEnum}</span>
                    </div>
                </div>
                <div className="orderItem-body">
                    <div className="infor-court py-3 ">
                        <div className="img-court w-48">
                            <img src={booking.court.imageUrl} alt="court" />
                        </div>
                        <div className="order-detail ms-3">
                            <p>
                                <b>Mã đơn hàng:</b> {booking.bookingId}
                            </p>
                            <p>
                                <b>Thời gian đặt đơn:</b> {booking.bookingDate}
                            </p>
                            <p className="booking-type">
                                <b>Dạng lịch:</b> {booking.bookingType}
                            </p>
                            {booking.flexibleBooking && (
                                <p>
                                    <b>Số giờ linh hoạt:</b> {booking.flexibleBooking.availableHours + booking.flexibleBooking.usedHours}
                                </p>
                            )}
                            <p>
                                <b>Hình thức thanh toán: </b>
                                {booking.totalPrice !== 0 ? (
                                    <>
                                        <i className="fa-brands fa-paypal"></i> <span> PayPal</span>
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faClock} className="text-info" /> <span> Giờ linh hoạt</span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="orderItem-footer">
                    <div className="total-price">
                        <b>Tổng tiền:</b> <span>{booking.totalPrice.toLocaleString("vi-VN")} VND</span>
                    </div>
                </div>
                <div className="orderItem-btn w-50 m-auto">
                    {booking.statusEnum !== "Đã hủy" && booking.statusEnum !== "Đã hoàn thành" && booking.statusEnum !== "Đang chờ check-in" && (
                        <button className="btn" onClick={() => handleCancelBooking(booking)}>
                            Hủy đơn
                        </button>
                    )}
                    {!booking.flexibleBooking && (
                        <button className="btn btn-success" onClick={() => setShowModal(true)}>
                            Chi tiết
                        </button>
                    )}
                </div>

                <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Chi tiết đơn</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {booking.statusEnum && booking?.bookingDetails?.length > 0 && (
                            <table className="table table-borderless">
                                <thead>
                                    <tr>
                                        <th>Slot</th>
                                        <th>Ngày check-in</th>
                                        <th>Sân</th>
                                        <th>{booking.totalPrice === 0 ? "Giờ" : "Giá (VND)"}</th>
                                        <th>Trạng thái</th>
                                        <th>Trạng thái thanh toán</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {booking.bookingDetails
                                        .sort((a, b) => a.yardSchedule.slot.slotName.localeCompare(b.yardSchedule.slot.slotName))
                                        .map((bookingDetail, index) => (
                                            <tr key={index}>
                                                <td>{bookingDetail.yardSchedule.slot.slotName}</td>
                                                <td>{bookingDetail.date}</td>
                                                <td>{bookingDetail.yardSchedule.yard.yardName}</td>
                                                <td>{booking.totalPrice === 0 ? bookingDetail.flexibleHours : bookingDetail.price.toLocaleString("vi-VN")}</td>
                                                <td style={{ color: getStatusTextColor(bookingDetail.status) }}>{bookingDetail.status}</td>
                                                <td><td style={{ color: getStatusTextColor(bookingDetail.paymentStatus) }}>{bookingDetail.paymentStatus}</td></td>
                                            </tr>
                                        ))}
                                    {booking.totalPrice === 0 ? (
                                        <tr>
                                            <td>
                                                <b>Giờ linh hoạt:</b>
                                            </td>
                                            <td colSpan="2"></td>
                                            <td style={{ color: "green", fontWeight: "bold" }}>
                                                {booking.totalPrice === 0 ? `${booking.totalHours} giờ` : `0 giờ`}
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <td>
                                                <b>Tổng tiền:</b>
                                            </td>
                                            <td colSpan="2"></td>
                                            <td style={{ color: "green", fontWeight: "bold" }}>{booking.totalPrice.toLocaleString("vi-VN")}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" className="p-2" onClick={() => setShowModal(false)}>
                            Đóng
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default OrderItem;
