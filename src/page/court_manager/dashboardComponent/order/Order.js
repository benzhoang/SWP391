import React, { Component } from "react";
import axiosInstance from "../../../../config/axiosConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faInbox } from "@fortawesome/free-solid-svg-icons";
import "./order.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { alert, showAlert, showConfirmPayment } from "../../../../utils/alertUtils";
import axios from "axios";

export default class Order extends Component {
    constructor(props) {
        super(props);
        this.state = {
            courts: [],
            selectedCourt: "",
            bookingsOfCourts: [],
            bookingsOfSelectedCourt: [],
            currentTab: "showProcessingOrder",
            bookings: [],
            searchQuery: "",
            showModal: false,
            bookingTypeFilter: "",
            currentPage: 1,
            itemsPerPage: 5,
            sortOrder: "",
            priceOrder: "asc",
            selectedBooking: null,
        };
    }

    componentDidMount() {
        this.fetchCourts();
        this.fetchBookingsOfCourts();
    }

    parseDate = (dateString) => {
        const [datePart, timePart] = dateString.split(" ");
        const [day, month, year] = datePart.split("/").map(Number);
        const [hour, minute] = timePart.split(":").map(Number);
        return new Date(year, month - 1, day, hour, minute);
    };

    fetchCourts = () => {
        axiosInstance
            .get("/court/courts-of-owner")
            .then((res) => {
                if (res.status === 200) {
                    const firstCourt = res.data[0];
                    this.setState({ courts: res.data, selectedCourt: firstCourt.courtId, selectedCourtName: firstCourt.courtName }, () => {
                        this.filterBookingsBySelectedCourt();
                    });
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    fetchBookingsOfCourts = () => {
        axiosInstance
            .get("/booking/bookings-of-courts")
            .then((res) => {
                if (res.status === 200) {
                    this.setState({ bookingsOfCourts: res.data }, () => {
                        this.filterBookingsBySelectedCourt();
                    });
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    getExchangeRate = async () => {
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
    handleCancelBooking = async (booking) => {
        try {
            showConfirmPayment(
                "Thông báo",
                "Bạn có chắc chắn muốn hủy đơn hàng của khách hàng này ?",
                "warning",
                "Chắc chắn",
                "Trở lại",
                "center"
            ).then(async (result) => {
                if (result.isConfirmed) {
                    if (booking && booking.bookingType === "Lịch linh hoạt") {
                        const bookingId = booking?.bookingId;

                        const cancelResponse = await axiosInstance.post(`/booking/${bookingId}/cancel`);

                        if (cancelResponse.data.message === "Đã hủy đơn hàng thành công.") {
                            alert(
                                "success",
                                "Thông báo",
                                "Hủy đơn hàng thành công ! Số giờ linh hoạt đã được hoàn vào tài khoản của khách hàng.",
                                "center"
                            );
                            this.fetchBookingsOfCourts();
                            return;
                        } else {
                            alert("error", "Thông báo", "Hủy đơn hàng không thành công !", "center");
                            return;
                        }
                    }

                    const exchangeRate = await this.getExchangeRate();
                    if (!exchangeRate) {
                        throw new Error("Failed to get exchange rate");
                    }

                    const saleId = booking?.payment?.saleId;

                    const refundAmount = booking?.payment?.paymentAmount / exchangeRate;

                    const refundResponse = await axiosInstance.post(`/paypal/refund/${saleId}/${refundAmount}`);

                    if (refundResponse.data.message === "Refund successful") {
                        const bookingId = booking?.bookingId;

                        const cancelResponse = await axiosInstance.post(`/booking/${bookingId}/cancel`);

                        if (cancelResponse.data.message === "Đã hủy đơn hàng thành công.") {
                            alert(
                                "success",
                                "Thông báo",
                                "Hủy đơn hàng thành công ! Số tiền đã được hoàn trả vào tài khoản Paypal của khách hàng.",
                                "center"
                            );
                            this.fetchBookingsOfCourts();
                        } else {
                            alert("error", "Thông báo", "Hủy đơn hàng không thành công !", "center");
                        }
                    }
                }
            });
        } catch (error) {
            console.error("Failed to cancel booking:", error);
        }
    };

    handleConfirmBooking = async (bookingId) => {
        try {
            const confirmResponse = await axiosInstance.post(`/booking/${bookingId}/confirm`);
            if (confirmResponse.data.message === "Xác nhận đơn hàng thành công") {
                showAlert("success", "Thông báo", "Xác nhận đơn hàng thành công !", "top-end");
                this.fetchBookingsOfCourts();
            } else {
                showAlert("error", "Thông báo", "Hủy đơn hàng không thành công !", "top-end");
            }
        } catch (error) {
            console.error("Failed to confirm booking:", error);
        }
    };

    setCurrentTab = (tab) => {
        this.setState({ currentTab: tab });
    };

    // Hàm để cập nhật giá trị tìm kiếm
    handleSearchQueryChange = (event) => {
        this.setState({ searchQuery: event.target.value });
    };

    handleCourtChange = (event) => {
        const courtId = event.target.value;
        const courtName = event.target.options[event.target.selectedIndex].text;
        this.setState(
            {
                selectedCourt: courtId,
                selectedCourtName: courtName,
            },
            () => {
                this.filterBookingsBySelectedCourt();
            }
        );
    };

    renderCourtOption = () => {
        return this.state.courts.map((court) => (
            <option key={court.courtId} value={court.courtId}>
                {court.courtName}
            </option>
        ));
    };

    filterBookingsBySelectedCourt = () => {
        const { bookingsOfCourts, selectedCourt } = this.state;
        const bookingsOfSelectedCourt = bookingsOfCourts[selectedCourt] || [];
        this.setState({ bookingsOfSelectedCourt });
    };

    filterBookings = (status) => {
        const { bookingsOfSelectedCourt, searchQuery, bookingTypeFilter } = this.state;
        return bookingsOfSelectedCourt
            .filter((booking) => booking.statusEnum === status)
            .filter((booking) => {
                const courtName = booking.courtName ? booking.courtName.toLowerCase() : "";
                const bookingId = booking.bookingId ? booking.bookingId.toString() : "";
                if (bookingTypeFilter) {
                    return booking.bookingType === bookingTypeFilter;
                }
                return courtName.includes(searchQuery.toLowerCase()) || bookingId.toLowerCase().includes(searchQuery.toLowerCase());
            });
    };

    handleShowModal = (booking) => {
        this.setState({ showModal: true, selectedBooking: booking });
    };

    handleCloseModal = () => {
        this.setState({ showModal: false, selectedBooking: null });
    };

    handlePageChange = (pageNumber) => {
        this.setState({ currentPage: pageNumber });
    };

    renderPagination = () => {
        const { bookingsOfSelectedCourt, currentPage, itemsPerPage } = this.state;
        const pageNumbers = [];
        for (let i = 1; i < Math.ceil(bookingsOfSelectedCourt.length / itemsPerPage); i++) {
            pageNumbers.push(i);
        }

        return (
            <nav>
                <ul className="pagination">
                    {pageNumbers.map((number) => (
                        <li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}>
                            <button onClick={() => this.handlePageChange(number)} className="page-link">
                                {number}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        );
    };
    parseDate = (dateString) => {
        const [datePart, timePart] = dateString.split(" ");
        const [day, month, year] = datePart.split("/").map(Number);
        const [hour, minute] = timePart.split(":").map(Number);
        return new Date(year, month - 1, day, hour, minute);
    };

    getStatusTextColor(status) {
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

    render() {
        const { currentTab, searchQuery, showModal, selectedBooking, currentPage, itemsPerPage, sortOrder, priceOrder } = this.state;
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;

        return (
            <div className=" orderManager historyPage">
                <div className="orderPage-body">
                    <div className="select-court d-flex" style={{ alignItems: "center" }}>
                        <label className="me-3">Chọn cơ sở: </label>
                        <select className="" style={{ height: 40 }} onChange={this.handleCourtChange}>
                            {this.renderCourtOption()}
                        </select>
                    </div>
                    <div>
                        <ul className="nav-status nav nav-pills nav-justified mb-3" id="pills-tab" role="tablist">
                            {["showProcessingOrder", "showCheckInOrder", "showCompleteOrder", "showCancelledOrder"].map((tab) => (
                                <li className="nav-item" role="presentation" key={tab}>
                                    <button
                                        className={`nav-link ${currentTab === tab ? "active" : ""}`}
                                        id={`${tab}-tab`}
                                        data-bs-toggle="pill"
                                        data-bs-target={`#${tab}`}
                                        type="button"
                                        role="tab"
                                        aria-controls={tab}
                                        aria-selected={currentTab === tab}
                                        onClick={() => this.setCurrentTab(tab)}
                                    >
                                        {tab === "showProcessingOrder" && "Đang chờ xử lý"}
                                        {tab === "showCheckInOrder" && "Đang chờ check-in"}
                                        {tab === "showCompleteOrder" && "Đã hoàn thành"}
                                        {tab === "showCancelledOrder" && "Đã hủy"}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            name="findOrder"
                            id="findOrder"
                            placeholder="Bạn có thể tìm kiếm theo tên sân hoặc mã đơn hàng"
                            value={this.state.searchQuery}
                            onChange={this.handleSearchQueryChange}
                        />
                    </div>

                    <div className="tab-content" id="pills-tabContent">
                        {["showProcessingOrder", "showCheckInOrder", "showCompleteOrder", "showCancelledOrder"].map((tab) => {
                            const filteredBookings = this.filterBookings(
                                tab === "showProcessingOrder"
                                    ? "Đang chờ xử lý"
                                    : tab === "showCheckInOrder"
                                        ? "Đang chờ check-in"
                                        : tab === "showCompleteOrder"
                                            ? "Đã hoàn thành"
                                            : "Đã hủy"
                            );

                            const currentBookingPage = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);

                            return (
                                <div
                                    key={tab}
                                    className={`tab-pane fade ${currentTab === tab ? "show active" : ""}`}
                                    id={tab}
                                    role="tabpanel"
                                    aria-labelledby={`${tab}-tab`}
                                >
                                    <div className="overflow-x-auto">
                                        <table className="table table-hover table-borderless">
                                            <thead>
                                                <tr>
                                                    <th className="text-start">STT</th>
                                                    <th className="text-start">Mã đơn hàng</th>
                                                    <th className="text-start">Khách hàng</th>
                                                    <th className="text-start">
                                                        <select
                                                            className="form-control"
                                                            value={this.state.bookingTypeFilter}
                                                            onChange={(e) => this.setState({ bookingTypeFilter: e.target.value })}
                                                        >
                                                            <option value="">Tất cả lịch</option>
                                                            <option value="Lịch đơn">Lịch đơn</option>
                                                            <option value="Lịch cố định">Lịch cố định</option>
                                                            <option value="Lịch linh hoạt">Lịch linh hoạt</option>
                                                        </select>
                                                    </th>
                                                    <th className="text-start">
                                                        <select
                                                            className="form-control"
                                                            value={this.state.priceOrder}
                                                            onChange={(e) => this.setState({ priceOrder: e.target.value, sortOrder: "" })}
                                                        >
                                                            <option value="asc">Giá tăng dần (VND)</option>
                                                            <option value="desc">Giá giảm dần (VND)</option>
                                                        </select>
                                                    </th>
                                                    <th className="text-start">
                                                        <select
                                                            className="form-control"
                                                            value={this.state.sortOrder}
                                                            onChange={(e) => this.setState({ sortOrder: e.target.value })}
                                                        >
                                                            <option value="">Tất cả</option>
                                                            <option value="asc">Ngày đặt tăng dần</option>
                                                            <option value="desc">Ngày đặt giảm dần</option>
                                                        </select>
                                                    </th>
                                                    <th className="text-center">Thao tác</th>
                                                </tr>
                                            </thead>
                                            {currentBookingPage.length > 0 ? (
                                                <tbody>
                                                    {currentBookingPage

                                                        .sort((a, b) => {
                                                            if (priceOrder === "asc") {
                                                                return a.totalPrice - b.totalPrice;
                                                            } else {
                                                                return b.totalPrice - a.totalPrice;
                                                            }
                                                        })
                                                        .sort((a, b) => {
                                                            const dateA = this.parseDate(a.bookingDate);
                                                            const dateB = this.parseDate(b.bookingDate);
                                                            if (sortOrder === "asc") {
                                                                return dateA - dateB;
                                                            } else if (sortOrder === "desc") {
                                                                return dateB - dateA;
                                                            } else {
                                                                return;
                                                            }
                                                        })
                                                        .map((booking, index) => (
                                                            <tr key={booking.bookingId}>
                                                                <td className="text-start">{index + 1}</td>
                                                                <td className="text-start">{booking.bookingId}</td>
                                                                <td className="text-start">
                                                                                                                                        <p>{booking.customer ? booking.customer.fullName : "Khách vãng lai"}</p>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                        {booking.customer ? booking.customer.email : "Không có"}
                                                                    </p>
                                                                </td>
                                                                <td className="text-start">{booking.bookingType}</td>
                                                                <td className="text-start">{booking.totalPrice.toLocaleString("vi-VN")}</td>
                                                                <td className="text-start">{booking.bookingDate}</td>
                                                                <td className="d-flex btn-action">
                                                                    <button
                                                                        className="btn btn-info mr-2 p-2"
                                                                        onClick={() => this.handleShowModal(booking)}
                                                                    >
                                                                        <i class="fa-solid fa-circle-info"></i>
                                                                    </button>
                                                                    {booking.statusEnum === "Đang chờ xử lý" && (
                                                                        <>
                                                                            <button
                                                                                className="btn btn-success mr-2 p-2"
                                                                                onClick={() => this.handleConfirmBooking(booking.bookingId)}
                                                                            >
                                                                                <i class="fa-solid fa-check-to-slot"></i>
                                                                            </button>
                                                                            <button
                                                                                className="btn btn-danger p-2"
                                                                                onClick={() => this.handleCancelBooking(booking)}
                                                                            >
                                                                                <i class="fa-solid fa-xmark"></i>
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            ) : (
                                                <tr className="">
                                                    <td colSpan={7} className="no-bookings text-center">
                                                        <FontAwesomeIcon icon={faInbox} size="3x" />
                                                        <p>Chưa có đơn hàng</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </table>
                                        {currentBookingPage.length > 0 && this.renderPagination()}
                                    </div>
                                </div>
                            );
                        })}
                        <Modal show={showModal} onHide={() => this.setState({ showModal: false })} centered size="lg">
                            <Modal.Header closeButton>
                                <Modal.Title>Chi tiết đơn</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {selectedBooking && (
                                    <div className="order-detail ms-3">
                                        <p>
                                            <b>Mã đơn hàng:</b> {selectedBooking.bookingId}
                                        </p>
                                        <p>
                                            <b>Khách hàng:</b> {selectedBooking.customer ? selectedBooking.customer.fullName : "Khách vãng lai"}
                                        </p>
                                        <p>
                                            <b>Email:</b> {selectedBooking.customer ? selectedBooking.customer.email : "Không có"}
                                        </p>
                                        <p>
                                            <b>Thời gian đặt đơn:</b> {selectedBooking.bookingDate}
                                        </p>
                                        <p className="booking-type">
                                            <b>Dạng lịch:</b> {selectedBooking.bookingType}
                                        </p>
                                        {selectedBooking.flexibleBooking && (
                                            <p>
                                                <b>Số giờ linh hoạt:</b>{" "}
                                                {selectedBooking.flexibleBooking.availableHours + selectedBooking.flexibleBooking.usedHours}
                                            </p>
                                        )}
                                        <p></p>
                                        <p>
                                            <b>Hình thức thanh toán: </b>
                                            {selectedBooking.totalPrice !== 0 ? (
                                                <>
                                                    <i className="fa-brands fa-paypal text-info"></i> <span> PayPal</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FontAwesomeIcon icon={faClock} className="text-info" /> <span> Giờ linh hoạt</span>
                                                </>
                                            )}
                                        </p>
                                        <hr />
                                        {/* Additional details */}
                                        {selectedBooking.statusEnum && selectedBooking?.bookingDetails?.length > 0 && (
                                            <table className="table table-borderless">
                                                <thead>
                                                    <tr>
                                                        <th>Slot</th>
                                                        <th>Ngày check-in</th>
                                                        <th>Sân</th>
                                                        <th>{selectedBooking.totalPrice === 0 ? "Giờ" : "Giá (VND)"}</th>
                                                        <th>Trạng thái thanh toán</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedBooking.bookingDetails
                                                        .sort((a, b) => a.yardSchedule.slot.slotName.localeCompare(b.yardSchedule.slot.slotName))
                                                        .map((bookingDetail, index) => (
                                                            <tr key={index}>
                                                                <td>{bookingDetail.yardSchedule.slot.slotName}</td>
                                                                <td>{bookingDetail.date}</td>
                                                                <td>{bookingDetail.yardSchedule.yard.yardName}</td>
                                                                <td>
                                                                    {selectedBooking.totalPrice === 0
                                                                        ? bookingDetail.flexibleHours
                                                                        : bookingDetail.price.toLocaleString("vi-VN")}
                                                                </td>
                                                                <td><td style={{ color: this.getStatusTextColor(bookingDetail.paymentStatus) }}>{bookingDetail.paymentStatus}</td></td>
                                                            </tr>
                                                        ))}
                                                    {selectedBooking.totalPrice === 0 ? (
                                                        <tr>
                                                            <td>
                                                                <b>Giờ linh hoạt:</b>
                                                            </td>
                                                            <td colSpan="2"></td>
                                                            <td style={{ color: "green", fontWeight: "bold" }}>
                                                                {selectedBooking.totalPrice === 0
                                                                    ? `${selectedBooking.totalHours} giờ`
                                                                    : 0}
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        <tr>
                                                            <td>
                                                                <b>Tổng tiền:</b>
                                                            </td>
                                                            <td colSpan="2"></td>
                                                            <td style={{ color: "green", fontWeight: "bold" }}>
                                                                {selectedBooking.totalPrice.toLocaleString("vi-VN")}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" style={{ padding: "10px" }} onClick={() => this.setState({ showModal: false })}>
                                    Đóng
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </div>
                </div>
            </div>
        );
    }
}
