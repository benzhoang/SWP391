import React, { Component } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays, format, eachDayOfInterval, parse, differenceInHours } from "date-fns";
import { sl, vi } from "date-fns/locale";
import "../../customer/bookingPage/formBooking/slot.css";
import "../../../css/style.css";
import axiosInstance from "../../../config/axiosConfig";
import { Button, Modal } from "react-bootstrap";
import "../staff.css";
import { showAlert } from "../../../utils/alertUtils";
// Register the Vietnamese locale with react-datepicker
registerLocale("vi", vi);

export default class CheckInPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            courtOfStaff: null,
            startDate: new Date(),
            endDate: addDays(new Date(), 6),
            daysOfWeek: [],
            slots: [],
            waitingCheckInSlots: [],
            pendingSlots: [],
            completedSlots: [],
            cancelledSlots: [],
            selectedSlots: {},
            bookingDetails: [],
            bookingDetailsList: [],
            selectedDay: null,
            selectedYard: "",
            errorMessage: "",
            bookingDetailsList: [],
            isLoggedIn: false,
            currentDate: new Date(),
            showModal: false,
            hoursToLoad: 0,
            user: "",
            flexibleBookings: [],
            availableHours: "",
            priceBoard: [],
            selectedSlotInfo: null,
            selectedCustomer: null,
            facilities: [],
        };
    }

    componentDidMount() {
        this.updateDaysOfWeek(this.state.startDate, this.state.endDate);
        this.fetchCourts();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.startDate !== this.state.startDate || prevState.endDate !== this.state.endDate) {
            this.updateDaysOfWeek(this.state.startDate, this.state.endDate);
        }

        if (prevState.selectedYard !== this.state.selectedYard) {
            this.fetchSlots();
            this.fetchBookingDetails();
            this.fetchStatusSlots("PENDING", "pendingSlots");
            this.fetchStatusSlots("WAITING_FOR_CHECK_IN", "waitingCheckInSlots");
            this.fetchStatusSlots("COMPLETED", "completedSlots");
            this.fetchStatusSlots("CANCELLED", "cancelledSlots");           
        }
    }

    fetchCourts = () => {
        axiosInstance
            .get("/court/court-of-staff")
            .then((res) => {
                if (res.status === 200) {
                    const courtOfStaff = res.data;
                    const firstYardId = courtOfStaff?.yards?.[0]?.yardId || "";
                    this.setState(
                        {
                            courtOfStaff: res.data,
                            selectedYard: firstYardId,
                        },
                        () => {
                            if (firstYardId) {
                                this.fetchSlots();
                            }

                            if (courtOfStaff) {
                                this.fetchFacilities();
                            }
                        }
                    );
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    fetchSlots = () => {
        if (!this.state.selectedYard) {
            this.setState({ slots: [] }); // Clear slots if no yard is selected
            return;
        }

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

    fetchFacilities = () => {
        axiosInstance
            .get(`court/facilities-of-court/${this.state.courtOfStaff.courtId}`)
            .then((response) => {
                this.setState({ facilities: response.data });
            })
            .catch((error) => {
                console.error("There was an error fetching the facilities!", error);
            });
    };

    fetchStatusSlots = (status, list) => {
        const formattedDates = this.state.daysOfWeek.map((day) => day.split(" ")[0]);

        axiosInstance
            .post(`/booking-details/${status}/slots/${this.state.selectedYard}`, formattedDates)
            .then((response) => {
                this.setState({ [list]: response.data });
                if (this.state.waitingCheckInSlots) {
                    this.checkAndAutoCancelCheckIn();
                }

            })
            .catch((error) => {
                console.error("There was an error fetching the booked slots!", error);
            });
    };

    fetchBookingDetails = () => {
        const formattedDates = this.state.daysOfWeek.map((day) => day.split(" ")[0]);

        axiosInstance
            .post(`/booking-details/${this.state.selectedYard}`, formattedDates)
            .then((response) => {
                this.setState({ bookingDetailsList: response.data });
            })
            .catch((error) => {
                console.error("There was an error fetching the booked slots!", error);
            });
    };

    setCurrentTab = (tab) => {
        this.setState({ currentTab: tab });
    };

    // Hàm để cập nhật giá trị tìm kiếm
    handleSearchQueryChange = (event) => {
        this.setState({ searchQuery: event.target.value });
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

    handleYardChange = (event) => {
        this.setState({ selectedYard: event.target.value });
    };

    isWaitingCheckInSlot = (dayKey, slotId) => {
        const { waitingCheckInSlots } = this.state;

        const parsedDate = parse(dayKey.split(" ")[0], "dd/MM/yyyy", new Date());
        const formattedDayKey = format(parsedDate, "yyyy-MM-dd");

        if (!waitingCheckInSlots[formattedDayKey] || waitingCheckInSlots[formattedDayKey].length === 0) {
            return false;
        }

        return waitingCheckInSlots[formattedDayKey].some((checkInDto) => checkInDto.bookingDetails.yardSchedule.slot.slotId === slotId);
    };

    isCompletedSlot = (dayKey, slotId) => {
        const { completedSlots } = this.state;

        const parsedDate = parse(dayKey.split(" ")[0], "dd/MM/yyyy", new Date());
        const formattedDayKey = format(parsedDate, "yyyy-MM-dd");

        if (!completedSlots[formattedDayKey] || completedSlots[formattedDayKey].length === 0) {
            return false;
        }

        return completedSlots[formattedDayKey].some((checkInDto) => checkInDto.bookingDetails.yardSchedule.slot.slotId === slotId);
    };

    isPendingSlot = (dayKey, slotId) => {
        const { pendingSlots } = this.state;

        const parsedDate = parse(dayKey.split(" ")[0], "dd/MM/yyyy", new Date());
        const formattedDayKey = format(parsedDate, "yyyy-MM-dd");

        if (!pendingSlots[formattedDayKey] || pendingSlots[formattedDayKey].length === 0) {
            return false;
        }

        return pendingSlots[formattedDayKey].some((checkInDto) => checkInDto.bookingDetails.yardSchedule.slot.slotId === slotId);
    };

    isCancelledSLot = (dayKey, slotId) => {
        const { cancelledSlots } = this.state;

        const parsedDate = parse(dayKey.split(" ")[0], "dd/MM/yyyy", new Date());
        const formattedDayKey = format(parsedDate, "yyyy-MM-dd");

        if (!cancelledSlots[formattedDayKey] || cancelledSlots[formattedDayKey].length === 0) {
            return false;
        }

        return cancelledSlots[formattedDayKey].some((checkInDto) => checkInDto.bookingDetails.yardSchedule.slot.slotId === slotId);
    };

    getStatusClass = (dayKey, slotId) => {
        const { bookingDetails } = this.state;

        const parsedDate = parse(dayKey.split(" ")[0], "dd/MM/yyyy", new Date());
        const formattedDayKey = format(parsedDate, "yyyy-MM-dd");

        if (!bookingDetails[formattedDayKey] || bookingDetails[formattedDayKey].length === 0) {
            return false;
        }

        // Tìm bookingDetails có slotId trùng khớp
        const checkInDto = bookingDetails[formattedDayKey]?.find((checkInDto) => checkInDto.bookingDetails.yardSchedule.slot.slotId === slotId);

        console.log("CheckInDto: ", checkInDto);

        if (!checkInDto) {
            return null;
        }

        const bookingDetail = checkInDto.bookingDetails.find((detail) => detail.yardSchedule.slot.slotId === slotId);

        if (!bookingDetail) {
            return null; // Return null if no bookingDetail matches the slotId
        }

        // Kiểm tra trạng thái của bookingDetail
        switch (bookingDetail.status) {
            case "Đang chờ xử lý":
                return "pending";
            case "Đang chờ check-in":
                return "waiting-check-in";
            case "Đã hoàn thành":
                return "completed";
            default:
                return null; // Trả về null hoặc giá trị thích hợp khác nếu trạng thái không khớp
        }
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
        const matchedCheckIn = bookingDetailsList[formattedDayKey].find(
            (checkInDto) => checkInDto?.bookingDetails?.yardSchedule?.slot?.slotId === slot.slotId
        );
        if (!matchedCheckIn) {
            console.error("No matching checkInDto found for the given slot");
            return slotStartTime < currentTime;
        }

        // Get the status from the found bookingDetails
        const status = matchedCheckIn.bookingDetails.status;

        // Do not apply pastTime if the status is pending, waiting-check-in, or completed
        if (status === "Đang chờ xử lý" || status === "Đã hoàn thành" || status === "Đã hủy") {
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

    handleSlotSelection = (slotId, dayIndex) => {
        const { slots, daysOfWeek } = this.state;
        const selectedSlot = slots.find((slot) => slot.slotId === slotId);
        const selectedDay = daysOfWeek[dayIndex];

        // You can fetch player info or other relevant details based on slotId and dayIndex
        // For now, store slot info in state and show modal
        this.setState({
            selectedSlotInfo: {
                slotId: slotId,
                day: selectedDay,
                slotName: selectedSlot.slotName,
                startTime: selectedSlot.startTime,
                endTime: selectedSlot.endTime,
                // Add more fields as needed
            },
            showModal: true,
        });
    };

    handleShowModal = (slot, day) => {
        const { bookingDetailsList } = this.state;

        const parsedDate = parse(day?.split(" ")[0], "dd/MM/yyyy", new Date());
        const formattedDayKey = format(parsedDate, "yyyy-MM-dd");

        if (!bookingDetailsList[formattedDayKey] || bookingDetailsList[formattedDayKey].length === 0) {
            return;
        }

        const matchedCheckIn = bookingDetailsList[formattedDayKey]?.find(
            (checkInDto) => checkInDto?.bookingDetails?.yardSchedule?.slot?.slotId === slot.slotId
        );

        if (matchedCheckIn) {
            const customer = matchedCheckIn.customer;
            const bookingDetailsFound = matchedCheckIn.bookingDetails;
            this.setState({ showModal: true, selectedCustomer: customer, selectedSlotInfo: slot, bookingDetails: bookingDetailsFound });
        } else {
            console.error("No matching checkInDto found for the given slot");
        }
    };

    handleCloseModal = () => {
        this.setState({ showModal: false, selectedCustomer: null });
    };

    handleCheckIn = async (detailId) => {
        try {
            const confirmResponse = await axiosInstance.post(`/booking-details/${detailId}/check-in`);
            if (confirmResponse.data.message === "Check-in thành công") {
                showAlert("success", "Thông báo", "Check-in thành công !", "top-end");
                this.handleCloseModal();
                this.fetchSlots();
                this.fetchBookingDetails();
                this.fetchStatusSlots("PENDING", "pendingSlots");
                this.fetchStatusSlots("WAITING_FOR_CHECK_IN", "waitingCheckInSlots");
                this.fetchStatusSlots("COMPLETED", "completedSlots");
                this.fetchStatusSlots("CANCELLED", "cancelledSlots");
            } else {
                showAlert("error", "Thông báo", "Check-in không thành công !", "top-end");
            }
        } catch (error) {
            console.error("Failed to check-in", error);
        }
    };

    handleCancelCheckIn = async (detailId) => {
        try {
            const confirmResponse = await axiosInstance.post(`/booking-details/${detailId}/cancel`);
            if (confirmResponse.data.message === "Hủy đơn thành công") {
                showAlert("success", "Thông báo", "Đã hủy đơn thành công !", "top-end");
                this.handleCloseModal();
                this.fetchSlots();
                this.fetchBookingDetails();
                this.fetchStatusSlots("PENDING", "pendingSlots");
                this.fetchStatusSlots("WAITING_FOR_CHECK_IN", "waitingCheckInSlots");
                this.fetchStatusSlots("COMPLETED", "completedSlots");
                this.fetchStatusSlots("CANCELLED", "cancelledSlots");
            } else {
                showAlert("error", "Thông báo", "Hủy đơn không thành công !", "top-end");
            }
        } catch (error) {
            console.error("Failed to cancel", error);
        }
    };

    checkAndAutoCancelCheckIn = () => {
        const currentDate = new Date();
        // Định dạng ngày hiện tại thành chuỗi YYYY-MM-DD
        const today = currentDate.toISOString().split('T')[0];

        // Lấy ra giá trị tương ứng với ngày hôm nay
        const waitingCheckInSlotsForToday = this.state.waitingCheckInSlots[today] || [];
    
        waitingCheckInSlotsForToday.forEach(checkInDto => {

            const slotStartTime = checkInDto?.bookingDetails?.yardSchedule?.slot?.startTime;
            
            if (slotStartTime) {
                const [slotHour, slotMinute] = slotStartTime.split(':').map(Number);
                const slotStartDateTime = new Date(currentDate);
                slotStartDateTime.setHours(slotHour, slotMinute, 0, 0); // Cập nhật giờ và phút cho đối tượng Date
    
                // So sánh thời gian slot với giờ hiện tại
                if (slotStartDateTime < currentDate) {
                    this.autoCancelCheckIn(checkInDto?.bookingDetails?.detailId); // Gọi hàm tự động hủy check-in
                }
            }
        });
    };

    autoCancelCheckIn = async (detailId) => {
        try {
            const confirmResponse = await axiosInstance.post(`/booking-details/${detailId}/cancel`);
            if (confirmResponse.data.message === "Hủy đơn thành công") {
                this.fetchSlots();
                this.fetchBookingDetails();
                this.fetchStatusSlots("PENDING", "pendingSlots");
                this.fetchStatusSlots("WAITING_FOR_CHECK_IN", "waitingCheckInSlots");
                this.fetchStatusSlots("COMPLETED", "completedSlots");
                this.fetchStatusSlots("CANCELLED", "cancelledSlots");
            }
        } catch (error) {
            console.error("Failed to cancel", error);
        }
    };

    render() {
        const { courtOfStaff } = this.state;
        const { daysOfWeek, selectedSlots, slots } = this.state;
        const selectedSlotDetails = Object.entries(selectedSlots).flatMap(([day, slotIds]) =>
            slotIds.map((slotId) => {
                const slot = slots.find((s) => s.slotId === slotId); // Tìm slot theo slotId
                return `${slot ? slot.slotName : "Unknown Slot"}`; // Kiểm tra nếu slot tồn tại
            })
        );
        const { facilities } = this.state;

        if (!courtOfStaff) {
            return <div>Đang tải thông tin của cơ sở</div>;
        }

        const renderStars = (rate) => {
            const totalStars = 5;
            const stars = [];
            for (let i = 1; i <= totalStars; i++) {
                if (i <= rate) {
                    stars.push(<span key={i} className="fa fa-star checked" style={{ color: "#ffc107" }}></span>);
                } else {
                    stars.push(<span key={i} className="fa fa-star" style={{ color: "#000000" }}></span>);
                }
            }
            return stars;
        };

        return (
            <div className="staffPageManager">
                <section className="detail-yard">
                    <h1>{courtOfStaff.courtName}</h1>
                    <div className="detail-yard-title">
                        <div className="address">
                            <p>
                                <i className="fa-solid fa-location-dot" /> Địa chỉ:
                                <span> {courtOfStaff.address}</span>
                            </p>
                        </div>
                    </div>
                    <div className="detail-yard-info row">
                        <div className="yard-left col-lg-6">
                            <h3>Thông tin sân</h3>
                            <p>
                                Số sân: <span>{courtOfStaff.yards.length}</span>
                            </p>
                            <p>
                                Giờ hoạt động:{" "}
                                <span>
                                    {courtOfStaff.openTime} - {courtOfStaff.closeTime}
                                </span>
                            </p>
                            <div className="yard-service row">
                                <h4>Dịch vụ tiện ích</h4>
                                {facilities.length > 0 ? (
                                    facilities.map((facility, index) => (
                                        <div className="col-lg-6" key={index}>
                                            <i className={`fa-solid ${facility.facilityIcon}`} /> {facility.facilityName}
                                        </div>
                                    ))
                                ) : (
                                    <p>Trống</p>
                                )}
                            </div>
                        </div>
                        <div className="yard-right col-lg-6">
                            <img className="h-100" src={courtOfStaff.imageUrl} alt />
                        </div>
                    </div>
                </section>
                <div className="checkin-form">
                    <form className="order row">
                        <div className="select-slot p-3">
                            <div className="orderPage-body">
                                <div className="tab-content" id="pills-tabContent">
                                    <div style={{ display: "flex", justifyContent: "center" }}>
                                        <div className="btn slot-time pastTime" style={{ width: "15%", height: "40px" }}>
                                            <b>Đã hết giờ</b>
                                        </div>
                                        <div className="btn slot-time completed" style={{ width: "15%", height: "40px", alignContent: "center" }}>
                                            <b>Đã hoàn thành</b>
                                        </div>
                                        <div
                                            className="btn slot-time waiting-check-in"
                                            style={{ width: "15%", height: "40px", alignContent: "center" }}
                                        >
                                            <b>Chờ check-in</b>
                                        </div>
                                        <div className="btn slot-time pending" style={{ width: "15%", height: "40px", alignContent: "center" }}>
                                            <b>Đã đặt</b>
                                        </div>
                                        <div className="btn slot-time" style={{ width: "15%", height: "40px" }}>
                                            <b>Trống</b>
                                        </div>
                                    </div>
                                    <select
                                        className="form-select my-3"
                                        aria-label="Default select example"
                                        value={this.state.selectedYard}
                                        onChange={this.handleYardChange}
                                    >
                                        <option value="">Chọn sân</option>
                                        {courtOfStaff?.yards
                                            ?.slice() // Create a shallow copy to avoid mutating the original array
                                            .sort((a, b) => a.yardName.localeCompare(b.yardName)) // Sort by yardName in ascending order
                                            .map((yard, index) => (
                                                <option key={index} value={yard.yardId}>
                                                    {yard.yardName}
                                                </option>
                                            ))}
                                    </select>
                                    <div>
                                        <div className="overflow-x-auto tableCheckIn">
                                            <div className="">
                                                <table className="table table-borderless">
                                                    <thead>
                                                        <tr>
                                                            <th className="">Slot</th>
                                                            {daysOfWeek?.map((day, index) => (
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
                                                                            className={`slot-time ${
                                                                                this.isWaitingCheckInSlot(daysOfWeek[dayIndex], slot.slotId)
                                                                                    ? "waiting-check-in"
                                                                                    : ""
                                                                            }
                                                                        ${
                                                                            this.isToday(daysOfWeek[dayIndex]) &&
                                                                            !this.isWaitingCheckInSlot(daysOfWeek[dayIndex], slot.slotId) &&
                                                                            this.isPastTime(daysOfWeek[dayIndex], slot.startTime, slot)
                                                                                ? "pastTime"
                                                                                : ""
                                                                        }
                                                                        ${this.isCompletedSlot(daysOfWeek[dayIndex], slot.slotId) ? "completed" : ""}
                                                                        ${this.isPendingSlot(daysOfWeek[dayIndex], slot.slotId) ? "pending" : ""}`}
                                                                            onClick={() => this.handleShowModal(slot, daysOfWeek[dayIndex])}
                                                                        >
                                                                            {`${slot.startTime} - ${slot.endTime}`}
                                                                        </div>
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                    <Modal show={this.state.showModal} onHide={() => this.setState({ showModal: false })} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Thông tin check-in</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <b>Khách hàng: </b> {this.state.selectedCustomer?.fullName} <br />
                            <b>Email: </b> {this.state.selectedCustomer?.email} <br />
                            <b>Ngày check-in: </b> {this.state.bookingDetails?.date} <br />
                            <b>Sân: </b> {this.state.bookingDetails?.yardSchedule?.yard?.yardName} <br />
                            <b>Slot: </b> {this.state.selectedSlotInfo?.slotName}
                            <br />
                            <b>Thời gian: </b> {this.state.selectedSlotInfo?.startTime} - {this.state.selectedSlotInfo?.endTime} <br />
                        </Modal.Body>
                        <Modal.Footer>
                            {this.state.bookingDetails?.status === "Đang chờ check-in" &&
                                this.isToday(this.state.bookingDetails?.date) &&
                                this.isPastTime(
                                    this.state.bookingDetails?.date,
                                    this.state.selectedSlotInfo?.startTime,
                                    this.state.selectedSlotInfo
                                ) && (
                                    <Button
                                        variant="danger"
                                        className="p-2"
                                        onClick={() => this.handleCancelCheckIn(this.state.bookingDetails?.detailId)}
                                    >
                                        Hủy
                                    </Button>
                                )}
                            {this.state.bookingDetails?.status === "Đang chờ check-in" &&
                                this.isToday(this.state.bookingDetails?.date) &&
                                !this.isPastTime(
                                    this.state.bookingDetails?.date,
                                    this.state.selectedSlotInfo?.startTime,
                                    this.state.selectedSlotInfo
                                ) && (
                                    <Button variant="primary" style={ {padding: '10px'} } onClick={() => this.handleCheckIn(this.state.bookingDetails?.detailId)}>
                                        Check-in
                                    </Button>
                                )}
                            <Button
                                className="p-2"
                                variant="secondary"
                                style={{ alignContent: "center" }}
                                onClick={() => this.setState({ showModal: false })}
                            >
                                Đóng
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        );
    }
}
