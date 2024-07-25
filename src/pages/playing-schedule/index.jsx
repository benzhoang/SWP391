import React, { Component } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays, format, eachDayOfInterval, parse, differenceInHours } from "date-fns";
import { sl, vi } from "date-fns/locale";
import axiosInstance from "../../config/axiosConfig";
import { alert, showAlert, showConfirmPayment } from "../../utils/alertUtils";
import Header from "../../components/header";
import Footer from "../../components/footer";
import "../playing-schedule/index.css";
import { Button, Modal } from "react-bootstrap";
import axios from "axios";
import Spinner from "../../components/snipper";

// Register the Vietnamese locale with react-datepicker
registerLocale("vi", vi);

export default class PlayingSchedule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            courtOfStaff: null,
            startDate: new Date(),
            endDate: addDays(new Date(), 6),
            daysOfWeek: [],
            slots: [
                {
                    "slotId": "TL0000044",
                    "slotName": "Slot 1",
                    "startTime": "07:30",
                    "endTime": "08:00",
                    "userId": "U0000027"
                },
                {
                    "slotId": "TL0000045",
                    "slotName": "Slot 2",
                    "startTime": "08:00",
                    "endTime": "09:00",
                    "userId": "U0000027"
                },
                {
                    "slotId": "TL0000046",
                    "slotName": "Slot 3",
                    "startTime": "09:00",
                    "endTime": "10:00",
                    "userId": "U0000027"
                },
                {
                    "slotId": "TL0000047",
                    "slotName": "Slot 4",
                    "startTime": "10:00",
                    "endTime": "11:00",
                    "userId": "U0000027"
                },
                {
                    "slotId": "TL0000048",
                    "slotName": "Slot 5",
                    "startTime": "11:00",
                    "endTime": "12:00",
                    "userId": "U0000027"
                },
                {
                    "slotId": "TL0000049",
                    "slotName": "Slot 6",
                    "startTime": "12:00",
                    "endTime": "13:00",
                    "userId": "U0000027"
                },
                {
                    "slotId": "TL0000050",
                    "slotName": "Slot 7",
                    "startTime": "13:00",
                    "endTime": "14:00",
                    "userId": "U0000027"
                },
                {
                    "slotId": "TL0000051",
                    "slotName": "Slot 8",
                    "startTime": "14:00",
                    "endTime": "15:00",
                    "userId": "U0000027"
                },
                {
                    "slotId": "TL0000052",
                    "slotName": "Slot 9",
                    "startTime": "15:00",
                    "endTime": "16:00",
                    "userId": "U0000027"
                },
                {
                    "slotId": "TL0000053",
                    "slotName": "Slot 10",
                    "startTime": "16:00",
                    "endTime": "17:00",
                    "userId": "U0000027"
                },
                {
                    "slotId": "TL0000054",
                    "slotName": "Slot 11",
                    "startTime": "17:00",
                    "endTime": "18:00",
                    "userId": "U0000027"
                },
                {
                    "slotId": "TL0000055",
                    "slotName": "Slot 12",
                    "startTime": "18:00",
                    "endTime": "19:00",
                    "userId": "U0000027"
                },
                {
                    "slotId": "TL0000056",
                    "slotName": "Slot 13",
                    "startTime": "19:00",
                    "endTime": "20:00",
                    "userId": "U0000027"
                },
                {
                    "slotId": "TL0000057",
                    "slotName": "Slot 14",
                    "startTime": "20:00",
                    "endTime": "21:00",
                    "userId": "U0000027"
                },
                {
                    "slotId": "TL0000193",
                    "slotName": "Slot 15",
                    "startTime": "21:00",
                    "endTime": "22:00",
                    "userId": "U0000027"
                }
            ],
            waitingCheckInSlots: [],
            pendingSlots: [],
            completedSlots: [],
            cancelledSlots: [],
            selectedSlots: {},
            isLoggedIn: false,
            currentDate: new Date(),
            showModal: false,
            user: "",
            selectedSlotInfo: null,
            selectedCourtInfo: null,
            selectedFeedbackInfo: null,
            selectedPaymentInfo: null,
            bookingDetails: null,
            isLoggedIn: false,
            user: {
                username: "",
                avatar: "",
                roles: [],
            },
            rating: 5,
            comment: "Good",
            isRated: false,
            loading: false
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
                    roles: user.roles,
                },
            });
        }

        this.updateDaysOfWeek(this.state.startDate, this.state.endDate);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.startDate !== this.state.startDate || prevState.endDate !== this.state.endDate) {
            this.updateDaysOfWeek(this.state.startDate, this.state.endDate);
        }

        if (prevState.daysOfWeek !== this.state.daysOfWeek) {
            this.fetchStatusSlots('WAITING_FOR_CHECK_IN', 'waitingCheckInSlots');
            this.fetchStatusSlots('COMPLETED', 'completedSlots');
            this.fetchStatusSlots('CANCELLED', 'cancelledSlots');
        }

        if (prevState.waitingCheckInSlots !== this.state.waitingCheckInSlots) {
            this.checkAndAutoCancelCheckIn();
        }
    }

    fetchStatusSlots = (status, list) => {
        this.setState({ loading: true });
        const formattedDates = this.state.daysOfWeek.map((day) => day.split(" ")[0]);

        axiosInstance
            .post(`/booking/${status}/slots`, formattedDates)
            .then((response) => {
                this.setState({ loading: false });
                this.setState({ [list]: response.data });
            })
            .catch((error) => {
                console.error("There was an error fetching the slots!", error);
            });
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

    isWaitingCheckInSlot = (dayKey, slotName) => {
        const { waitingCheckInSlots } = this.state;

        const parsedDate = parse(dayKey.split(" ")[0], "dd/MM/yyyy", new Date());
        const formattedDayKey = format(parsedDate, "yyyy-MM-dd");

        if (!waitingCheckInSlots[formattedDayKey] || waitingCheckInSlots[formattedDayKey].length === 0) {
            return false;
        }

        return waitingCheckInSlots[formattedDayKey].some((checkInDto) => checkInDto.bookingDetails.yardSchedule.slot.slotName === slotName);
    };

    isCompletedSlot = (dayKey, slotName) => {
        const { completedSlots } = this.state;

        const parsedDate = parse(dayKey.split(" ")[0], "dd/MM/yyyy", new Date());
        const formattedDayKey = format(parsedDate, "yyyy-MM-dd");

        if (!completedSlots[formattedDayKey] || completedSlots[formattedDayKey].length === 0) {
            return false;
        }

        return completedSlots[formattedDayKey].some((checkInDto) => checkInDto.bookingDetails.yardSchedule.slot.slotName === slotName);
    };

    isCancelledSlot = (dayKey, slotId) => {
        const { cancelledSlots } = this.state;

        const parsedDate = parse(dayKey.split(" ")[0], "dd/MM/yyyy", new Date());
        const formattedDayKey = format(parsedDate, "yyyy-MM-dd");

        if (!cancelledSlots[formattedDayKey] || cancelledSlots[formattedDayKey].length === 0) {
            return false;
        }

        return cancelledSlots[formattedDayKey].some((checkInDto) => checkInDto.bookingDetails.yardSchedule.slot.slotId === slotId);
    };


    isPastTime(day, startTime, slot) {
        const currentTime = new Date();
        const [startHour, startMinute] = startTime.split(":").map(Number);
        const slotStartTime = new Date(currentTime);
        slotStartTime.setHours(startHour, startMinute, 0, 0);

        const { bookingDetailsList } = this.state;

        // Parse and format day to match the format used in bookingDetailsList
        const parsedDate = parse(day?.split(" ")[0], "dd/MM/yyyy", new Date());
        const formattedDayKey = format(parsedDate, "yyyy-MM-dd");

        // Check if there are any bookings for the formatted day
        if (!bookingDetailsList[formattedDayKey] || bookingDetailsList[formattedDayKey].length === 0) {
            return slotStartTime < currentTime;
        }

        // Find the matching bookingDetails based on slotId
        const matchedCheckIn = bookingDetailsList[formattedDayKey].find(checkInDto => checkInDto?.bookingDetails?.yardSchedule?.slot?.slotId === slot.slotId);
        if (!matchedCheckIn) {
            console.error('No matching checkInDto found for the given slot');
            return slotStartTime < currentTime;
        }

        // Get the status from the found bookingDetails
        const status = matchedCheckIn.bookingDetails.status;

        // Do not apply pastTime if the status is pending, waiting-check-in, or completed
        if (status === 'Đang chờ xử lý' || status === 'Đã hoàn thành' || status === 'Đã hủy') {
            return false;
        }

        // Otherwise, check if the slotStartTime is in the past relative to currentTime
        return slotStartTime < currentTime;
    }

    isToday(day) {
        const parsedDate = parse(day.split(" ")[0], "dd/MM/yyyy", new Date());
        const formattedDayKey = format(parsedDate, "yyyy-MM-dd");
        const today = new Date();
        const formattedToday = format(today, "yyyy-MM-dd");
        return formattedToday === formattedDayKey;
    }

    handleShowModal = (status, slot, day) => {
        const { waitingCheckInSlots, completedSlots, cancelledSlots } = this.state;

        const parsedDate = parse(day?.split(" ")[0], "dd/MM/yyyy", new Date());
        const formattedDayKey = format(parsedDate, "yyyy-MM-dd");

        let matchedplayingScheduleDto = null;

        // Duyệt qua danh sách tương ứng với trạng thái
        switch (status) {
            case "waiting-check-in":
                matchedplayingScheduleDto = waitingCheckInSlots[formattedDayKey]?.find((playingScheduleDto) => playingScheduleDto.bookingDetails.yardSchedule.slot.slotName === slot.slotName);
                break;
            case "completed":
                matchedplayingScheduleDto = completedSlots[formattedDayKey]?.find((playingScheduleDto) => playingScheduleDto.bookingDetails.yardSchedule.slot.slotName === slot.slotName);
                break;
            case "cancel":
                matchedplayingScheduleDto = cancelledSlots[formattedDayKey]?.find((playingScheduleDto) => playingScheduleDto.bookingDetails.yardSchedule.slot.slotName === slot.slotName);
                break;
            default:
                console.error('Unknown status:', status);
                return;
        }

        if (matchedplayingScheduleDto) {
            const court = matchedplayingScheduleDto.court;
            const bookingDetailsFound = matchedplayingScheduleDto.bookingDetails;
            const payment = matchedplayingScheduleDto.payment;
            const feedback = null;

            if (matchedplayingScheduleDto.feedback) {
                feedback = matchedplayingScheduleDto.feedback;
            }
            this.setState({ showModal: true, selectedCourtInfo: court, selectedSlotInfo: slot, bookingDetails: bookingDetailsFound, selectedFeedbackInfo: feedback, selectedPaymentInfo: payment });
        } else {
            console.error('No matching checkInDto found for the given slot');
        }
    };


    handleCloseModal = () => {
        this.setState({ showModal: false, selectedCustomer: null });
    };


    handleLogout = () => {
        localStorage.removeItem("user");

        this.setState({
            isLoggedIn: false,
            user: {
                username: "",
                avatar: "",
                roles: [],
            },
        });

        window.location.href = "/";
    };

    convertStringDateTimeToDateTime(dateString, timeString) {
        // Convert date string from "dd/MM/yyyy" to "yyyy-MM-dd"
        const [day, month, year] = dateString.split('/').map(Number);
        const formattedDate = new Date(year, month - 1, day, ...timeString.split(':').map(Number));

        // Format the date to "YYYY-MM-DD HH:mm"
        const yearFormatted = formattedDate.getFullYear();
        const monthFormatted = String(formattedDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const dayFormatted = String(formattedDate.getDate()).padStart(2, '0');
        const hoursFormatted = String(formattedDate.getHours()).padStart(2, '0');
        const minutesFormatted = String(formattedDate.getMinutes()).padStart(2, '0');

        const combinedDateTime = `${yearFormatted}-${monthFormatted}-${dayFormatted} ${hoursFormatted}:${minutesFormatted}`;

        return new Date(combinedDateTime);
    }

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

    handleCancelCheckIn = async (bookingDetails, payment, court) => {
        try {
            const bookingDateTime = this.convertStringDateTimeToDateTime(bookingDetails.date, bookingDetails.yardSchedule.slot.startTime);
            const currentDateTime = new Date();

            // Calculate the difference in milliseconds
            const differenceInMillis = bookingDateTime - currentDateTime;

            // Convert milliseconds to hours
            const hoursDifference = Math.floor(differenceInMillis / (1000 * 60 * 60));

            let confirmResponse = null;

            if (hoursDifference >= 24) {
                if (payment) {
                    const exchangeRate = await this.getExchangeRate();
                    if (!exchangeRate) {
                        throw new Error("Failed to get exchange rate");
                    }

                    const saleId = payment.saleId;
                    const refundAmount = bookingDetails.price / exchangeRate;

                    const result = await showConfirmPayment("Thông báo", "Bạn có chắc muốn hủy giờ chơi này ?", "warning", "Chắc chắn", "Trở lại", "center");
                    if (result.isConfirmed) {
                        this.setState({ loading: true });
                        const refundResponse = await axiosInstance.post(`/paypal/refund/${saleId}/${refundAmount}`);

                        if (refundResponse.data.message === "Refund successful") {
                            console.log("Refund successful.");
                            confirmResponse = await axiosInstance.post(`/booking-details/${bookingDetails.detailId}/cancel?refund=true`);
                            this.setState({ loading: false });
                            if (confirmResponse && confirmResponse.data.message === 'Hủy đơn thành công') {
                                alert(
                                    "success",
                                    "Thông báo",
                                    "Hủy giờ chơi thành công ! Số tiền của giờ chơi đã được hoàn trả vào tài khoản Paypal của bạn.",
                                    "center"
                                );

                                this.handleCloseModal();
                                this.fetchStatusSlots('WAITING_FOR_CHECK_IN', 'waitingCheckInSlots');
                                this.fetchStatusSlots('COMPLETED', 'completedSlots');
                                this.fetchStatusSlots('CANCELLED', 'cancelledSlots');
                            } else if (!confirmResponse) {
                                showAlert('error', 'Thông báo', 'Hủy giờ chơi không thành công !', 'top-end');
                            }
                        } else {
                            throw new Error("Refund failed");
                        }
                    } else if (result.dismiss) {
                        return;
                    }
                } else {
                    const result = await showConfirmPayment("Thông báo", "Bạn có chắc muốn hủy giờ chơi này ?", "warning", "Chắc chắn", "Trở lại", "center");

                    if (result.isConfirmed) {
                        this.setState({ loading: true });
                        const refundResponse = await axiosInstance.post(`/booking-details/${bookingDetails.detailId}/refund-hours`);

                        if (refundResponse.data.message === "Refund flexible hours successful") {
                            confirmResponse = await axiosInstance.post(`/booking-details/${bookingDetails.detailId}/cancel?refund=true`);
                            this.setState({ loading: false });
                            if (confirmResponse && confirmResponse.data.message === 'Hủy đơn thành công') {
                                alert(
                                    "success",
                                    "Thông báo",
                                    `Hủy giờ chơi thành công ! Số giờ linh hoạt đã được hoàn vào lịch linh hoạt của bạn ở cơ sở ${court?.courtName}.`,
                                    "center"
                                );

                                this.handleCloseModal();
                                this.fetchStatusSlots('WAITING_FOR_CHECK_IN', 'waitingCheckInSlots');
                                this.fetchStatusSlots('COMPLETED', 'completedSlots');
                                this.fetchStatusSlots('CANCELLED', 'cancelledSlots');
                            } else if (!confirmResponse) {
                                showAlert('error', 'Thông báo', 'Hủy giờ chơi không thành công !', 'top-end');
                            }
                        } else {
                            throw new Error("Refund failed");
                        }
                    } else if (result.dismiss) {
                        return;
                    }
                }
            } else {
                const result = await showConfirmPayment("Lưu ý", `Bạn chỉ cách thời gian check in ${hoursDifference} tiếng (nhỏ hơn 24 tiếng)! Bạn sẽ không được hoàn lại tiền (hoặc giờ linh hoạt) nếu hủy giờ chơi này.`, "warning", "Đồng ý", "Trở lại", "center");
                if (result.isConfirmed) {
                    this.setState({ loading: true });
                    confirmResponse = await axiosInstance.post(`/booking-details/${bookingDetails.detailId}/cancel?refund=false`);
                    this.setState({ loading: false });
                    if (confirmResponse && confirmResponse.data.message === 'Hủy đơn thành công') {
                        alert(
                            "success",
                            "Thông báo",
                            "Hủy giờ chơi thành công !",
                            "center"
                        );

                        this.handleCloseModal();
                        this.fetchStatusSlots('WAITING_FOR_CHECK_IN', 'waitingCheckInSlots');
                        this.fetchStatusSlots('COMPLETED', 'completedSlots');
                        this.fetchStatusSlots('CANCELLED', 'cancelledSlots');
                    } else if (!confirmResponse) {
                        showAlert('error', 'Thông báo', 'Hủy giờ chơi không thành công !', 'top-end');
                    }
                } else if (result.dismiss) {
                    return;
                }
            }
        } catch (error) {
            console.error('Failed to cancel', error);
            showAlert('error', 'Thông báo', 'Đã xảy ra lỗi trong quá trình hủy giờ chơi!', 'top-end');
        }
    }


    checkAndAutoCancelCheckIn = () => {
        const currentDate = new Date();
        // Định dạng ngày hiện tại thành chuỗi YYYY-MM-DD
        const today = currentDate.toISOString().split('T')[0];

        // Lấy ra giá trị tương ứng với ngày hôm nay
        const waitingCheckInSlotsForToday = this.state.waitingCheckInSlots[today] || [];

        waitingCheckInSlotsForToday.forEach(checkInDto => {

            const slotEndTime = checkInDto?.bookingDetails?.yardSchedule?.slot?.endTime;

            if (slotEndTime) {
                const [slotHour, slotMinute] = slotEndTime.split(':').map(Number);
                const slotEndDateTime = new Date(currentDate);
                slotEndDateTime.setHours(slotHour, slotMinute, 0, 0); // Cập nhật giờ và phút cho đối tượng Date

                // So sánh thời gian slot với giờ hiện tại
                if (slotEndDateTime < currentDate) {
                    this.autoCancelCheckIn(checkInDto?.bookingDetails?.detailId); // Gọi hàm tự động hủy check-in
                }
            }
        });
    };

    autoCancelCheckIn = async (detailId) => {
        try {
            const confirmResponse = await axiosInstance.post(`/booking-details/${detailId}/cancel?refund=false`);
            if (confirmResponse.data.message === "Hủy đơn thành công") {
                this.fetchStatusSlots("WAITING_FOR_CHECK_IN", "waitingCheckInSlots");
                this.fetchStatusSlots("COMPLETED", "completedSlots");
                this.fetchStatusSlots("CANCELLED", "cancelledSlots");
            }
        } catch (error) {
            console.error("Failed to cancel", error);
        }
    };

    handleRatingClick = (rating) => {
        this.setState({ rating, isRated: true });
    };

    handleCommentChange = (event) => {
        this.setState({ comment: event.target.value });
    };

    handleSubmitRating = () => {
        // Logic to handle submission of rating and comment
        console.log(`Rating: ${this.state.rating}, Comment: ${this.state.comment}`);
    };

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
        const { daysOfWeek, isLoggedIn, user, loading } = this.state;

        return (
            <div className="playing-schedule-page">
                <Header isLoggedIn={isLoggedIn} user={user} handleLogout={this.handleLogout} />
                <section className="form-booking">
                    <div className="booking row">
                        <div className="col-lg-12">
                            <div className="">

                                <div className="week-navigation">
                                    {/* Nút để lùi về tuần trước */}
                                    <button className="navigation-button" onClick={this.handlePreviousWeek}>Tuần trước</button>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <div className="btn slot-time completed" style={{ width: '100px', height: '40px', alignContent: 'center' }}><b>Đã chơi</b></div>
                                        <div className="btn slot-time waiting-check-in" style={{ width: '100px', height: '40px', alignContent: 'center' }}><b>Chờ check-in</b></div>
                                    </div>
                                    {/* Nút để next sang tuần sau */}
                                    <button className="navigation-button" onClick={this.handleNextWeek}>Tuần sau</button>
                                </div>
                                <form className="order row">
                                    <div className="select-slot p-3">
                                        <div className="tab-content" id="pills-tabContent">
                                            <div
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
                                                            {this.state.slots.map((slot) => (
                                                                <tr key={slot.slotId}>
                                                                    <td>{slot.slotName}</td>
                                                                    {daysOfWeek.map((day, dayIndex) => {
                                                                        const isWaitingCheckIn = this.isWaitingCheckInSlot(day, slot.slotName);
                                                                        const isCompleted = this.isCompletedSlot(day, slot.slotName);

                                                                        const status = isWaitingCheckIn ? "waiting-check-in" :
                                                                            isCompleted ? "completed" : null;
                                                                        return (
                                                                            <td key={dayIndex} className="slot-times-column">
                                                                                <div
                                                                                    className={`slot-time ${isWaitingCheckIn ? "waiting-check-in" : ""}
                                                                                                          ${isCompleted ? "completed" : ""}`}
                                                                                    onClick={() => this.handleShowModal(status, slot, daysOfWeek[dayIndex])}
                                                                                >
                                                                                    {(isWaitingCheckIn || isCompleted) ? (
                                                                                        `${slot.startTime} - ${slot.endTime}`
                                                                                    ) : (
                                                                                        ""
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            ))}
                                                        </tbody>

                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                <Modal
                                    show={this.state.showModal}
                                    onHide={() => this.setState({ showModal: false })}
                                    centered
                                    dialogClassName="modal-card"
                                >
                                    <Modal.Header closeButton>
                                        <Modal.Title>Thông tin chi tiết</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        {loading && <Spinner />}
                                        <div className="modal-body-ticket">
                                            <div className="checkin-info">
                                                <h4>{this.state.selectedCourtInfo?.courtName}</h4>
                                                <b>Ngày check-in: </b> {this.state.bookingDetails?.date} <br />
                                                <b>Sân: </b> {this.state.bookingDetails?.yardSchedule?.yard?.yardName} <br />
                                                <b>Slot: </b> {this.state.selectedSlotInfo?.slotName} <br />
                                                <b>Thời gian: </b> {this.state.selectedSlotInfo?.startTime} - {this.state.selectedSlotInfo?.endTime} <br />
                                            </div>
                                            <div className="court-info">
                                                <img src={this.state.selectedCourtInfo?.image} alt="Court" />
                                                <i className="fa-solid fa-location-dot" style={{ color: 'red' }}></i> <b>{this.state.selectedCourtInfo?.address}</b>
                                            </div>
                                        </div>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        {this.state.bookingDetails?.status === 'Đang chờ check-in' && (
                                            <Button variant="danger" style={{ padding: '10px' }} onClick={() => this.handleCancelCheckIn(this.state.bookingDetails, this.state.selectedPaymentInfo, this.state.selectedCourtInfo)}>
                                                Hủy đơn
                                            </Button>
                                        )}
                                        <Button variant="secondary" style={{ padding: '10px' }} onClick={() => this.setState({ showModal: false })}>
                                            Đóng
                                        </Button>
                                    </Modal.Footer>
                                </Modal>
                            </div>
                        </div>
                    </div>
                </section>
                <Footer />
            </div>

        );
    }
}
