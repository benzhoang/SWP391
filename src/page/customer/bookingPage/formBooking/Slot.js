import React, { Component } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays, format, eachDayOfInterval, parse, differenceInHours, isEqual } from "date-fns";
import { vi } from "date-fns/locale";
import axiosInstance from "../../../../config/axiosConfig";
import NapGio from "./NapGio";
import { alert, showAlert, showConfirmPayment } from "../../../../utils/alertUtils";
import "./slot.css";
import PriceBpard from "./PriceBpard";
import HuyGio from "./HuyGio";

// Register the Vietnamese locale with react-datepicker
registerLocale("vi", vi);

export default class Slot extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: new Date(),
            endDate: addDays(new Date(), 6),
            daysOfWeek: [],
            selectedTab: "lichdon",
            slots: [],
            pendingSlots: [],
            waitingCheckInSlots: [],
            selectedSlots: {},
            selectedDay: null,
            selectedYard: "",
            errorMessage: "",
            bookingDetailsList: [],
            isLoggedIn: false,
            currentDate: new Date(),
            showModal: false,
            hoursToLoad: 0,
            user: "",
            courtId: this.props.court?.courtId,
            flexibleBookings: [],
            availableHours: "",
            priceBoard: [],
            activeTab: "dangky",
            pendingAndWaitingBookingDetailsList: []
        };
    }

    componentDidMount() {
        this.updateDaysOfWeek(this.state.startDate, this.state.endDate);

        if (this.props.court && this.props.court.yards && this.props.court.yards.length > 0) {
            this.setState({ selectedYard: this.props.court.yards[0].yardId });
        } else {
            this.fetchSlots();
        }
        const user = JSON.parse(localStorage.getItem("user"));

        this.checkUserLoginStatus();
        this.fetchPriceList();
    }

    checkUserLoginStatus() {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            this.setState({ isLoggedIn: true, user: user });
            this.fetchPendingAndWaitingBookingDetails();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.startDate !== this.state.startDate || prevState.endDate !== this.state.endDate) {
            this.updateDaysOfWeek(this.state.startDate, this.state.endDate);
        }

        if (prevState.selectedYard !== this.state.selectedYard) {
            this.fetchSlots();
            this.fetchStatusSlots("PENDING", "pendingSlots");
            this.fetchStatusSlots("WAITING_FOR_CHECK_IN", "waitingCheckInSlots");
        }

        if (prevState.daysOfWeek !== this.state.daysOfWeek) {
            this.fetchStatusSlots("PENDING", "pendingSlots");
            this.fetchStatusSlots("WAITING_FOR_CHECK_IN", "waitingCheckInSlots");
        }
    }

    fetchSlots = () => {
        axiosInstance
            .get(`/yard-schedule/getAllByYardId/${this.state.selectedYard}`)
            .then((response) => {
                console.log("Slots data received:", response.data);
                this.setState({ slots: response.data });
            })
            .catch((error) => {
                console.error("There was an error fetching the slots!", error);
            });
    };

    fetchFlexibleBookings = () => {
        axiosInstance
            .get(`/booking/flexible-bookings/${this.state.courtId}`)
            .then((response) => {
                this.setState({ flexibleBookings: response.data });
            })
            .catch((error) => {
                console.error("There was an error fetching the flexible bookings !", error);
            });
    };

    fetchStatusSlots = (status, list) => {
        const formattedDates = this.state.daysOfWeek.map((day) => day.split(" ")[0]);

        console.log("Fetching booked slots for dates:", formattedDates); // Log dates

        axiosInstance
            .post(`/booking-details/${status}/slots/${this.state.selectedYard}`, formattedDates)
            .then((response) => {
                console.log("Booked slots data received:", response.data); // Log response data
                this.setState({ [list]: response.data });
            })
            .catch((error) => {
                console.error("There was an error fetching the booked slots!", error);
            });
    };

    fetchPendingAndWaitingBookingDetails =() => {
        axiosInstance
            .get(`/booking-details`)
            .then((response) => {
                this.setState({ pendingAndWaitingBookingDetailsList: response.data });
            })
            .catch((error) => {
                console.error("There was an error fetching the data !", error);
            });
    }

    fetchPriceList = () => {
        axiosInstance
            .get(`/price-list/court/${this.state.courtId}`)
            .then((response) => {
                this.setState({ priceBoard: response.data });
            })
            .catch((error) => {
                console.error("Error fetching price list:", error);
            });
    };

    getAvailableHours = () => {
        const { flexibleBookings } = this.state;

        if (!flexibleBookings || flexibleBookings.length === 0) {
            return 0;
        }

        let totalAvailableHours = 0;

        flexibleBookings.forEach((booking) => {
            totalAvailableHours += booking.availableHours;
        });

        return totalAvailableHours;
    };

    handlePopupToggle = () => {
        this.setState({ showModal: !this.state.showModal });
    };

    handleHoursChange = (event) => {
        this.setState({ hoursToLoad: event.target.value });
    };

    updateDaysOfWeek = (start, end) => {
        const days = eachDayOfInterval({ start, end }).map((date) => format(date, "dd/MM/yyyy EEEE", { locale: vi }));
        this.setState({ daysOfWeek: days });
    };

    handleStartDateChange = (date) => {
        this.setState({ startDate: date });
    };

    handleEndDateChange = (date) => {
        this.setState({ endDate: date });
    };

    handleTabChange = (tab) => {
        if (tab === 'linhhoat') {
            this.fetchFlexibleBookings();
        }
        this.setState({
            selectedTab: tab, selectedSlots: {}, selectedDay: null,
            errorMessage: "", bookingDetailsList: [], startDate: new Date(),
            endDate: addDays(new Date(), 6)
        });
    };

    handleSlotSelection = (slot, dayIndex) => {
        const { selectedTab, selectedSlots, selectedDay, bookingDetailsList, slots, selectedYard } = this.state;
        const dayKey = this.state.daysOfWeek[dayIndex];
        const newSelectedSlots = { ...selectedSlots };
        if (!newSelectedSlots[dayKey]) {
            newSelectedSlots[dayKey] = [];
        }

        if (selectedTab === "lichdon" || selectedTab === "linhhoat") {
            if (selectedDay !== null && selectedDay !== dayIndex && !newSelectedSlots[dayKey].includes(slot)) {
                showAlert('warning', 'Thông báo', 'Bạn chỉ có thể chơi nhiều slot trong cùng ngày với Lịch đơn và Lịch linh hoạt.', 'top')
                return;
            }

            if (newSelectedSlots[dayKey].includes(slot)) {
                newSelectedSlots[dayKey] = newSelectedSlots[dayKey].filter((s) => s !== slot);
                if (newSelectedSlots[dayKey].length === 0) {
                    delete newSelectedSlots[dayKey];
                }
                const updatedBookingDetailsList = bookingDetailsList.filter(
                    (detail) => !(detail.slotId === slot && detail.date === dayKey.split(" ")[0])
                );
                this.setState({ bookingDetailsList: updatedBookingDetailsList });
            } else {
                newSelectedSlots[dayKey].push(slot);
                const slotDetail = slots.find((s) => s.slotId === slot);

                const formattedDate = dayKey.split(" ")[0];
                const newBookingDetail = {
                    date: formattedDate,
                    yardId: selectedYard,
                    slotId: slotDetail.slotId,
                };
                this.setState((prevState) => ({
                    bookingDetailsList: [...prevState.bookingDetailsList, newBookingDetail],
                }));
            }

            this.setState(
                {
                    selectedSlots: newSelectedSlots,
                    selectedDay: Object.keys(newSelectedSlots).length > 0 ? dayIndex : null,
                    errorMessage: "",
                },
                () => {
                    console.log(this.state.bookingDetailsList);
                }
            );
        } else if (selectedTab === "codinh") {
            if (newSelectedSlots[dayKey].includes(slot)) {
                newSelectedSlots[dayKey] = newSelectedSlots[dayKey].filter((s) => s !== slot);
                if (newSelectedSlots[dayKey].length === 0) {
                    delete newSelectedSlots[dayKey];
                }
                const updatedBookingDetailsList = bookingDetailsList.filter(
                    (detail) => !(detail.slotId === slot && detail.date === dayKey.split(" ")[0])
                );
                this.setState({ bookingDetailsList: updatedBookingDetailsList });
            } else {
                newSelectedSlots[dayKey].push(slot);
                const slotDetail = slots.find((s) => s.slotId === slot);

                const formattedDate = dayKey.split(" ")[0];
                const newBookingDetail = {
                    date: formattedDate,
                    yardId: selectedYard,
                    slotId: slotDetail.slotId,
                };
                this.setState((prevState) => ({
                    bookingDetailsList: [...prevState.bookingDetailsList, newBookingDetail],
                }));
            }

            this.setState(
                {
                    selectedSlots: newSelectedSlots,
                    selectedDay: Object.keys(newSelectedSlots).length > 0 ? dayIndex : null,
                    errorMessage: "",
                },
                () => {
                    console.log(this.state.bookingDetailsList);
                }
            );
        }
    };

    handleButtonClick = (event) => {
        event.preventDefault();

        if (!this.state.isLoggedIn) {
            window.location.href = "/login";
            return;
        }

        if (this.state.bookingDetailsList.length === 0) {
            this.setState({ errorMessage: "Hãy chọn slot bạn muốn chơi" });
            return;
        }

        let url = "";
        let data = {};
        const { selectedTab, bookingDetailsList } = this.state;
        const courtId = this.props.court.courtId;
    
        let isPendingOrWaiting = false;
        bookingDetailsList.forEach(bookingDetail => {
            const date = bookingDetail.date;
            const slotId = bookingDetail.slotId;
            const slot = this.state.slots.find((s) => s.slotId === slotId);
    
            // Gọi hàm isPendingAndWaitingBookingDetails với ngày và slotId từ bookingDetail
            isPendingOrWaiting = this.isPendingAndWaitingBookingDetails(date, slotId);
    
            if (isPendingOrWaiting) {
                alert('warning', 'Thông báo', `Đã có lịch đặt với khung giờ ${slot.startTime} - ${slot.endTime}. Hãy kiểm tra lại lịch chơi và đặt lại !`, 'center');
                return;
            }
        });

        if (isPendingOrWaiting) return;

        const totalRequiredHours = bookingDetailsList.reduce((total, bookingDetailsRequest) => {
            const slot = this.state.slots.find((s) => s.slotId === bookingDetailsRequest.slotId);
            const startTime = parse(slot.startTime, "HH:mm", new Date());
            const endTime = parse(slot.endTime, "HH:mm", new Date());
            const duration = differenceInHours(endTime, startTime);
            return total + duration;
        }, 0);

        switch (selectedTab) {
            case "linhhoat":
                url = `/booking/${courtId}/flexible`;
                data = bookingDetailsList;
                if (totalRequiredHours > this.getAvailableHours()) {
                    this.setState({ errorMessage: "Không đủ giờ linh hoạt để đặt." });
                    return;
                }
                break;
            case "lichdon":
                url = `/booking/${courtId}/single-day`;
                data = bookingDetailsList;
                break;
            case "codinh":
                url = `/booking/${courtId}/fixed`;
                data = bookingDetailsList;
                break;
            default:
                console.error("Invalid selectedTab value!");
                return;
        }

        if (selectedTab === "linhhoat") {
            axiosInstance
                .post(url, data)
                .then((response) => {
                    if (response.status === 200) {
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
                    } 
                })
                .catch((error) => {
                    console.error("There was an error when booking !", error);
                });
        } else {
            axiosInstance
                .post(url, data)
                .then((response) => {
                    if (response.status === 200) {
                        localStorage.setItem("booking", JSON.stringify(response.data));
                        window.location.href = "/detailBooking";
                    } 
                })
                .catch((error) => {
                    console.error("There was an error when booking !", error);
                });
        }
    };

    handleYardChange = (event) => {
        this.setState({ selectedYard: event.target.value });
    };

    isPendingAndWaitingBookingDetails = (dayKey, slotId) => {
        const { pendingAndWaitingBookingDetailsList } = this.state;

        const parsedDate = parse(dayKey.split(" ")[0], "dd/MM/yyyy", new Date());
        const slot = this.state.slots.find((s) => s.slotId === slotId);
        const slotStartTime = slot.startTime;

        const result = pendingAndWaitingBookingDetailsList.some(detail => {
            const detailDate = parse(detail.date, "dd/MM/yyyy", new Date());
            const detailSlotStartTime = detail.yardSchedule.slot.startTime;
    
            return isEqual(detailDate, parsedDate) && detailSlotStartTime === slotStartTime;
        });
    
        return result;
    }

    isSlotBooked = (dayKey, slotId) => {
        const { pendingSlots, waitingCheckInSlots } = this.state;

        const parsedDate = parse(dayKey.split(" ")[0], "dd/MM/yyyy", new Date());
        const formattedDayKey = format(parsedDate, "yyyy-MM-dd");

        // Kiểm tra nếu không có slot nào cho ngày này trong pendingSlots hoặc waitingCheckInSlots
        if (!pendingSlots[formattedDayKey] || !waitingCheckInSlots[formattedDayKey]) {
            return false;
        }

        // Lấy ra các bookingDetails từ pendingSlots và waitingCheckInSlots
        const pendingBookingDetails = pendingSlots[formattedDayKey].flatMap((checkInDto) => checkInDto.bookingDetails);
        const waitingCheckInBookingDetails = waitingCheckInSlots[formattedDayKey].flatMap((checkInDto) => checkInDto.bookingDetails);

        console.log("Pending Booking Details:", pendingBookingDetails);
        console.log("Waiting Check-In Booking Details:", waitingCheckInBookingDetails);

        // Kiểm tra xem slotId có trong các yardSchedules không
        const isPendingSlot = pendingBookingDetails.some((bookingDetails) => bookingDetails.yardSchedule.slot.slotId === slotId);
        const isWaitingCheckInSlot = waitingCheckInBookingDetails.some((bookingDetails) => bookingDetails.yardSchedule.slot.slotId === slotId);

        return isPendingSlot || isWaitingCheckInSlot;
    };

    isPastTime(startTime) {
        const currentTime = new Date();
        const [startHour, startMinute] = startTime.split(":").map(Number);
        const slotStartTime = new Date(currentTime);
        slotStartTime.setHours(startHour, startMinute, 0, 0);

        return slotStartTime < currentTime;
    }

    isToday(day) {
        const parsedDate = parse(day.split(" ")[0], "dd/MM/yyyy", new Date());
        const formattedDayKey = format(parsedDate, "yyyy-MM-dd");
        const today = new Date();
        const formattedToday = format(today, "yyyy-MM-dd");
        return formattedToday === formattedDayKey;
    }

    isYesterday(day) {
        const parsedDate = parse(day.split(" ")[0], "dd/MM/yyyy", new Date());
        const formattedDayKey = format(parsedDate, "yyyy-MM-dd");
        const today = new Date();
        const formattedToday = format(today, "yyyy-MM-dd");

        return formattedToday > formattedDayKey;
    }

    isDaysOfNextMonth(day) {
        const parsedDate = parse(day.split(" ")[0], "dd/MM/yyyy", new Date());
        const today = new Date();

        const nextMonth = today.getMonth() === 11 ? 0 : today.getMonth() + 1;
        const nextMonthYear = today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear();

        const isNextMonth = parsedDate.getMonth() === nextMonth && parsedDate.getFullYear() === nextMonthYear;

        return isNextMonth;
    }

    handlePreviousWeek = () => {
        const { startDate, endDate } = this.state;
        const newStartDate = addDays(startDate, -7);
        const newEndDate = addDays(endDate, -7);

        this.setState({ startDate: newStartDate, endDate: newEndDate });
    };

    handleNextWeek = () => {
        const { startDate, endDate } = this.state;
        const newStartDate = addDays(startDate, 7);
        const newEndDate = addDays(endDate, 7);

        this.setState({ startDate: newStartDate, endDate: newEndDate });
    };

    render() {
        const { court } = this.props;
        const { startDate, endDate, daysOfWeek, selectedTab, selectedSlots, errorMessage, slots } = this.state;
        const selectedSlotDetails = Object.entries(selectedSlots).flatMap(([day, slotIds]) =>
            slotIds.map((slotId) => {
                const slot = slots.find((s) => s.slotId === slotId); // Tìm slot theo slotId
                return `${slot ? slot.slotName : "Unknown Slot"}`; // Kiểm tra nếu slot tồn tại
            })
        );

        return (
            <div className="">
                <form className="order row">
                    <div className="select-slot p-3">
                        <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link ${selectedTab === "lichdon" ? "active" : ""}`}
                                    id="lichdon"
                                    data-bs-toggle="pill"
                                    data-bs-target="#pills-lichdon"
                                    type="button"
                                    role="tab"
                                    aria-controls="pills-lichdon"
                                    aria-selected={selectedTab === "lichdon"}
                                    onClick={() => this.handleTabChange("lichdon")}
                                >
                                    Lịch đơn
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link ${selectedTab === "codinh" ? "active" : ""}`}
                                    id="lichCoDinh-tabs"
                                    data-bs-toggle="pill"
                                    data-bs-target="#pills-codinh"
                                    type="button"
                                    role="tab"
                                    aria-controls="pills-codinh"
                                    aria-selected={selectedTab === "codinh"}
                                    onClick={() => this.handleTabChange("codinh")}
                                >
                                    Lịch cố định
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link ${selectedTab === "linhhoat" ? "active" : ""}`}
                                    id="linhhoat-tabs"
                                    data-bs-toggle="pill"
                                    data-bs-target="#pills-linhhoat"
                                    type="button"
                                    role="tab"
                                    aria-controls="pills-linhhoat"
                                    aria-selected={selectedTab === "linhhoat"}
                                    onClick={() => this.handleTabChange("linhhoat")}
                                >
                                    Lịch linh hoạt
                                </button>
                            </li>
                            <li>
                                <div>
                                    <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                                        Xem thông tin bảng giá
                                    </button>
                                    <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="modalPriceBoard" aria-hidden="true">
                                        <PriceBpard priceBoard={this.state.priceBoard} />
                                    </div>
                                </div>
                            </li>
                        </ul>
                        {selectedTab === "linhhoat" && <h2 style={{ fontSize: "30px" }}>Số giờ linh hoạt hiện có: {this.getAvailableHours()} giờ</h2>}

                        <select
                            className="form-select my-3"
                            aria-label="Default select example"
                            value={this.state.selectedYard}
                            onChange={this.handleYardChange}
                        >
                            <option value="">Chọn sân</option>
                            {court?.yards
                                ?.slice() // Create a shallow copy to avoid mutating the original array
                                .sort((a, b) => a.yardName.localeCompare(b.yardName)) // Sort by yardName in ascending order
                                .map((yard, index) => (
                                    <option key={index} value={yard.yardId}>
                                        {yard.yardName}
                                    </option>
                                ))}
                        </select>
                        <div className="week-navigation">
                            {/* Nút để lùi về tuần trước */}
                            <button type="button" className="navigation-button" onClick={this.handlePreviousWeek}>Tuần trước</button>
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <div className="btn slot-time pastTime" style={{ width: "100px", height: "40px", alignContent: "center" }}>
                                    <b>Đã hết giờ</b>
                                </div>
                                <div className="btn slot-time booked" style={{ width: "100px", height: "40px", alignContent: "center" }}>
                                    <b>Đã đặt</b>
                                </div>
                                <div className="btn slot-time selected" style={{ width: "100px", height: "40px", pointerEvents: "none" }}>
                                    Đang chọn
                                </div>
                            </div>
                            {/* Nút để next sang tuần sau */}
                            <button type="button" className="navigation-button" onClick={this.handleNextWeek}>Tuần sau</button>
                        </div>
                        <div className="tab-content" id="pills-tabContent">
                            <div
                                className={`tab-pane fade ${selectedTab === "lichdon" ? "show active" : ""}`}
                                id="pills-lichdon"
                                role="tabpanel"
                                aria-labelledby="lichdon"
                            >
                                <div className="overflow-x-auto">
                                    <table className="table table-borderless">
                                        <thead>
                                            <tr>
                                                <th>Slot</th>
                                                {daysOfWeek.map((day, index) => (
                                                    <th key={index}>{day}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.slots.map((slot, slotIndex) => (
                                                <tr key={slot.slotId}>
                                                    <td>{slot.slotName}</td>
                                                    {daysOfWeek.map((_, dayIndex) => (
                                                        <td key={dayIndex} className="slot-times-column">
                                                            <div
                                                                className={`slot-time ${selectedSlots[daysOfWeek[dayIndex]]?.includes(slot.slotId) ? "selected" : ""
                                                                    } ${this.isSlotBooked(daysOfWeek[dayIndex], slot.slotId) &&
                                                                        this.isToday(daysOfWeek[dayIndex]) &&
                                                                        this.isPastTime(slot.startTime)
                                                                        ? "pastTime"
                                                                        : this.isSlotBooked(daysOfWeek[dayIndex], slot.slotId)
                                                                            ? "booked"
                                                                            : ""
                                                                    } ${this.isToday(daysOfWeek[dayIndex]) && this.isPastTime(slot.startTime)
                                                                        ? "pastTime"
                                                                        : ""
                                                                    }
                                                                ${this.isYesterday(daysOfWeek[dayIndex]) ? "yesterday" : ""}`}
                                                                onClick={
                                                                    !this.isDaysOfNextMonth(daysOfWeek[dayIndex]) &&
                                                                        !this.isSlotBooked(daysOfWeek[dayIndex], slot.slotId) &&
                                                                        !(this.isToday(daysOfWeek[dayIndex]) && this.isPastTime(slot.startTime))
                                                                        ? () => this.handleSlotSelection(slot.slotId, dayIndex)
                                                                        : null
                                                                }
                                                            >
                                                                {this.isDaysOfNextMonth(daysOfWeek[dayIndex]) ? "N/A" : `${slot.startTime} - ${slot.endTime}`}
                                                            </div>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div
                                className={`tab-pane fade ${selectedTab === "codinh" ? "show active" : ""}`}
                                id="pills-codinh"
                                role="tabpanel"
                                aria-labelledby="lichCoDinh-tabs"
                            >
                                <div className="overflow-x-auto">
                                    <table className="table table-borderless">
                                        <thead>
                                            <tr>
                                                <th>Slot</th>
                                                {daysOfWeek.map((day, index) => (
                                                    <th key={index}>{day}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.slots.map((slot, slotIndex) => (
                                                <tr key={slot.slotId}>
                                                    <td>{slot.slotName}</td>
                                                    {daysOfWeek.map((_, dayIndex) => (
                                                        <td key={dayIndex} className="slot-times-column">
                                                            <div
                                                                className={`slot-time ${selectedSlots[daysOfWeek[dayIndex]]?.includes(slot.slotId) ? "selected" : ""
                                                                    } ${this.isSlotBooked(daysOfWeek[dayIndex], slot.slotId) &&
                                                                        this.isToday(daysOfWeek[dayIndex]) &&
                                                                        this.isPastTime(slot.startTime)
                                                                        ? "pastTime"
                                                                        : this.isSlotBooked(daysOfWeek[dayIndex], slot.slotId)
                                                                            ? "booked"
                                                                            : ""
                                                                    } ${this.isToday(daysOfWeek[dayIndex]) && this.isPastTime(slot.startTime)
                                                                        ? "pastTime"
                                                                        : ""
                                                                    }
                                                                ${this.isYesterday(daysOfWeek[dayIndex]) ? "yesterday" : ""}`}
                                                                onClick={
                                                                    !this.isDaysOfNextMonth(daysOfWeek[dayIndex]) &&
                                                                        !this.isSlotBooked(daysOfWeek[dayIndex], slot.slotId) &&
                                                                        !(this.isToday(daysOfWeek[dayIndex]) && this.isPastTime(slot.startTime))
                                                                        ? () => this.handleSlotSelection(slot.slotId, dayIndex)
                                                                        : null
                                                                }
                                                            >
                                                                {this.isDaysOfNextMonth(daysOfWeek[dayIndex]) ? "N/A" : `${slot.startTime} - ${slot.endTime}`}
                                                            </div>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div
                                className={`tab-pane fade ${selectedTab === "linhhoat" ? "show active" : ""}`}
                                id="pills-linhhoat"
                                role="tabpanel"
                                aria-labelledby="linhhoat-tabs"
                            >
                                <div className="row">
                                    <div className="col-md-8">
                                        <div className="overflow-x-auto">
                                            <table className="table table-borderless">
                                                <thead>
                                                    <tr>
                                                        <th>Slot</th>
                                                        {daysOfWeek.map((day, index) => (
                                                            <th key={index}>{day}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.slots.map((slot, slotIndex) => (
                                                        <tr key={slot.slotId}>
                                                            <td>{slot.slotName}</td>
                                                            {daysOfWeek.map((_, dayIndex) => (
                                                                <td key={dayIndex} className="slot-times-column">
                                                                    <div
                                                                        className={`slot-time ${selectedSlots[daysOfWeek[dayIndex]]?.includes(slot.slotId)
                                                                            ? "selected"
                                                                            : ""
                                                                            } ${this.isSlotBooked(daysOfWeek[dayIndex], slot.slotId) &&
                                                                                this.isToday(daysOfWeek[dayIndex]) &&
                                                                                this.isPastTime(slot.startTime)
                                                                                ? "pastTime"
                                                                                : this.isSlotBooked(daysOfWeek[dayIndex], slot.slotId)
                                                                                    ? "booked"
                                                                                    : ""
                                                                            } ${this.isToday(daysOfWeek[dayIndex]) && this.isPastTime(slot.startTime)
                                                                                ? "pastTime"
                                                                                : ""
                                                                            }
                                                                        ${this.isYesterday(daysOfWeek[dayIndex]) ? "yesterday" : ""}`}
                                                                        onClick={
                                                                            !this.isDaysOfNextMonth(daysOfWeek[dayIndex]) &&
                                                                                !this.isSlotBooked(daysOfWeek[dayIndex], slot.slotId) &&
                                                                                !(this.isToday(daysOfWeek[dayIndex]) && this.isPastTime(slot.startTime))
                                                                                ? () => this.handleSlotSelection(slot.slotId, dayIndex)
                                                                                : null
                                                                        }
                                                                    >
                                                                        {this.isDaysOfNextMonth(daysOfWeek[dayIndex]) ? "N/A" : `${slot.startTime} - ${slot.endTime}`}
                                                                    </div>
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="tabs">
                                            <button
                                                type="button"
                                                onClick={() => this.setState({ activeTab: "dangky" })}
                                                className={this.state.activeTab === "dangky" ? "active" : ""}
                                            >
                                                Đăng ký tổng giờ chơi
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => this.setState({ activeTab: "huyvachuyendoi" })}
                                                className={this.state.activeTab === "huyvachuyendoi" ? "active" : ""}
                                            >
                                                Hủy và chuyển đổi giờ
                                            </button>
                                        </div>

                                        <div className="tab-content">
                                            {this.state.activeTab === "dangky" && this.state.priceBoard && this.state.courtId && (
                                                <NapGio priceList={this.state.priceBoard} courtId={this.state.courtId} />
                                            )}
                                            {this.state.activeTab === "huyvachuyendoi" && this.state.priceBoard && this.state.courtId && (
                                                <HuyGio
                                                    priceList={this.state.priceBoard}
                                                    courtId={this.state.courtId}
                                                    onHoursCancel={this.fetchFlexibleBookings}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {errorMessage && (
                                <div className="alert alert-danger" role="alert">
                                    {errorMessage}
                                </div>
                            )}
                            <>
                                <div>
                                    Bạn đã chọn:
                                    {this.state.bookingDetailsList
                                        .reduce((acc, bookingDetail, index) => {
                                            const selectedSlot = this.state.slots.find((slot) => slot.slotId === bookingDetail.slotId);
                                            if (!selectedSlot) {
                                                return acc;
                                            }
                                            const existingDate = acc.find((item) => item.date === bookingDetail.date);
                                            if (existingDate) {
                                                existingDate.slots.push(selectedSlot.slotName);
                                            } else {
                                                acc.push({
                                                    date: bookingDetail.date,
                                                    slots: [selectedSlot.slotName],
                                                });
                                            }
                                            return acc;
                                        }, [])
                                        .map((item, index) => (
                                            <div key={index}>
                                                Ngày: {item.date}: {item.slots.join(", ")}
                                            </div>
                                        ))}
                                </div>
                                <div className="w-25 m-auto">
                                    <button onClick={this.handleButtonClick} className="btn btn-primary">
                                        Đặt sân ngay
                                    </button>
                                </div>
                            </>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}
