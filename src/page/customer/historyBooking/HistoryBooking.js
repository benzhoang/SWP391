import React, { Component } from "react";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import "./style.css";
import OrderItem from "./statusBooking/OrderItem";
import axiosInstance from "../../../config/axiosConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInbox, faFilter } from "@fortawesome/free-solid-svg-icons";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

export default class HistoryBooking extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTab: "showProcessingOrder",
            bookings: [],
            searchQuery: "",
            sortField: "bookingDate",
            sortOrder: "asc",
            isLoggedIn: false,
            user: {
                username: "",
                avatar: "",
                email: "",
                phone: "",
                balance: 0,
                roles: [],
            },
            currPage: 1,
            itemOrderPerPage: 2,
            bookingType: "Tất cả", // Add bookingType state
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

        this.fetchBookings();
    }

    fetchBookings = () => {
        axiosInstance
            .get("/booking/bookings")
            .then((response) => {
                console.log(response.data);
                this.setState({ bookings: response.data });
            })
            .catch((error) => {
                console.error("There was an error fetching the bookings!", error);
            });
    };

    handleLogout = () => {
        localStorage.removeItem("user");

        this.setState({
            isLoggedIn: false,
            user: {
                username: "",
                avatar: "",
                email: "",
                phone: "",
                balance: 0,
                roles: [],
            },
        });

        window.location.href = "/";
    };

    setCurrentTab = (tab) => {
        this.setState({ currentTab: tab, currPage: 1 });
    };

    handleSearchQueryChange = (event) => {
        this.setState({ searchQuery: event.target.value, currPage: 1 });
    };

    handleSortFieldChange = (field, order) => {
        this.setState({ sortField: field, sortOrder: order });
    };

    handleBookingTypeChange = (event) => {
        this.setState({ bookingType: event.target.value, currPage: 1 });
    };

    filterAndSortBookings = (status) => {
        const { bookings, searchQuery, sortField, sortOrder, bookingType } = this.state;
        return bookings
            .filter((booking) => booking.statusEnum === status)
            .filter((booking) => bookingType === "Tất cả" || booking.bookingType === bookingType)
            .filter((booking) => {
                const courtName = booking.court ? booking.court.courtName.toLowerCase() : "";
                const bookingId = booking.bookingId ? booking.bookingId.toLowerCase() : "";

                return courtName.includes(searchQuery.toLowerCase()) || bookingId.includes(searchQuery.toLowerCase());
            })
            .sort((a, b) => {
                let aField = a[sortField];
                let bField = b[sortField];

                if (sortField === "bookingDate") {
                    return sortOrder === "asc" ? new Date(aField) - new Date(bField) : new Date(bField) - new Date(aField);
                } else {
                    aField = aField ? aField.toString() : "";
                    bField = bField ? bField.toString() : "";
                    return sortOrder === "asc" ? aField.localeCompare(bField) : bField.localeCompare(aField);
                }
            });
    };

    handlePageChange = (page) => {
        this.setState({ currPage: page });
    };

    getCurrentPageBookings = (bookings) => {
        const { currPage, itemOrderPerPage } = this.state;
        const startIndex = (currPage - 1) * itemOrderPerPage;
        return bookings.slice(startIndex, startIndex + itemOrderPerPage);
    };

    renderPagination = (filteredBookings) => {
        const { currPage, itemOrderPerPage } = this.state;
        const pageNumber = [];

        for (let i = 1; i <= Math.ceil(filteredBookings.length / itemOrderPerPage); i++) {
            pageNumber.push(i);
        }

        return (
            <nav aria-label="Page navigation example">
                <ul className="pagination">
                    <li className={`page-item ${currPage === 1 ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => this.handlePageChange(currPage - 1)} aria-label="Previous">
                            <span aria-hidden="true">&laquo;</span>
                            <span className="sr-only">Previous</span>
                        </button>
                    </li>
                    {pageNumber.map((number) => (
                        <li key={number} className={`page-item ${currPage === number ? "active" : ""}`}>
                            <button onClick={() => this.handlePageChange(number)} className="page-link">
                                {number}
                            </button>
                        </li>
                    ))}
                    <li className={`page-item ${currPage === pageNumber.length ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => this.handlePageChange(currPage + 1)} aria-label="Next">
                            <span aria-hidden="true">&raquo;</span>
                            <span className="sr-only">Next</span>
                        </button>
                    </li>
                </ul>
            </nav>
        );
    };

    render() {
        const { currentTab, isLoggedIn, user, searchQuery, bookingType } = this.state;
        const filteredBookings = this.filterAndSortBookings(currentTab);
        const currentBookingPage = this.getCurrentPageBookings(filteredBookings);

        return (
            <div className="historyPage">
                <Header isLoggedIn={isLoggedIn} user={user} handleLogout={this.handleLogout} />
                <div className="historyPage-body w-75 m-auto">
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
                    <div className="findOrder mb-3">
                        <input
                            type="text"
                            className="form-control"
                            name="findOrder"
                            id="findOrder"
                            placeholder="Bạn có thể tìm kiếm theo tên sân hoặc mã đơn hàng"
                            value={searchQuery}
                            onChange={this.handleSearchQueryChange}
                        />
                    </div>
                    <div className="d-flex align-items-center">
                        <div className="mb-3  ">
                            <DropdownButton id="dropdown-basic-button" title={<FontAwesomeIcon icon={faFilter} />}>
                                <Dropdown.Item onClick={() => this.handleSortFieldChange("totalPrice", "asc")}>Giá tăng dần</Dropdown.Item>
                                <Dropdown.Item onClick={() => this.handleSortFieldChange("totalPrice", "desc")}>Giá giảm dần</Dropdown.Item>
                                <Dropdown.Item onClick={() => this.handleSortFieldChange("bookingDate", "asc")}>Ngày tăng dần</Dropdown.Item>
                                <Dropdown.Item onClick={() => this.handleSortFieldChange("bookingDate", "desc")}>Ngày giảm dần</Dropdown.Item>
                                <Dropdown.Item onClick={() => this.handleSortFieldChange("bookingId", "asc")}>Mã đơn tăng dần</Dropdown.Item>
                                <Dropdown.Item onClick={() => this.handleSortFieldChange("bookingId", "desc")}>Mã đơn giảm dần</Dropdown.Item>
                            </DropdownButton>
                        </div>
                        <div className="mb-3 d-flex align-items-center w-25 ">
                            <label className="text-nowrap me-2">Dạng lich: </label>
                            <select className="form-control" value={bookingType} onChange={this.handleBookingTypeChange}>
                                <option value="Tất cả">Tất cả</option>
                                <option value="Lịch đơn">Lịch đơn</option>
                                <option value="Lịch cố định">Lịch cố định</option>
                                <option value="Lịch linh hoạt">Lịch linh hoạt</option>
                            </select>
                        </div>
                    </div>
                    <div className="tab-content" id="pills-tabContent">
                        {["showProcessingOrder", "showCheckInOrder", "showCompleteOrder", "showCancelledOrder"].map((tab) => {
                            const statusText =
                                tab === "showProcessingOrder"
                                    ? "Đang chờ xử lý"
                                    : tab === "showCheckInOrder"
                                    ? "Đang chờ check-in"
                                    : tab === "showCompleteOrder"
                                    ? "Đã hoàn thành"
                                    : "Đã hủy";
                            const filteredBookings = this.filterAndSortBookings(statusText);
                            const currentBookingPage = this.getCurrentPageBookings(filteredBookings);

                            return (
                                <div
                                    key={tab}
                                    className={`tab-pane fade ${currentTab === tab ? "show active" : ""}`}
                                    id={tab}
                                    role="tabpanel"
                                    aria-labelledby={`${tab}-tab`}
                                >
                                    {currentBookingPage.length > 0 ? (
                                        currentBookingPage.map((booking) => (
                                            <OrderItem key={booking.bookingId} booking={booking} onBookingCancel={this.fetchBookings} />
                                        ))
                                    ) : (
                                        <div className="no-bookings">
                                            <FontAwesomeIcon icon={faInbox} size="3x" />
                                            <p>Chưa có đơn hàng</p>
                                        </div>
                                    )}
                                    {filteredBookings.length > 0 && <div className="mt-4">{this.renderPagination(filteredBookings)}</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <Footer />
            </div>
        );
    }
}