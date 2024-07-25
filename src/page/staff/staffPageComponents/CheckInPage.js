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
import { alert, showAlert } from "../../../utils/alertUtils";
import { FaCalendarAlt, FaClock, FaMoneyBill } from 'react-icons/fa';
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
            bookingDetailsRequestList: [],
            selectedDay: null,
            selectedYard: "",
            errorMessage: "",
            bookingDetailsList: [],
            isLoggedIn: false,
            currentDate: new Date(),
            showModalSlotDetails: false,
            showModalBookingForVisitors: false,
            hoursToLoad: 0,
            user: "",
            flexibleBookings: [],
            availableHours: "",
            priceBoard: [],
            selectedSlotInfo: null,
            selectedCustomer: null,
            facilities: [],
            priceOfSingleSchedule: 0,
            cash: '',
            isCashEdited: false,
            bookDisable: true,
            loading: false,
            bookingDetailsMap: new Map(),
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

        if (prevState.bookingDetailsRequestList !== this.state.bookingDetailsRequestList) {
            this.updateBookingDetailsMap();
        }

        if (prevState.selectedYard !== this.state.selectedYard) {
            this.fetchSlots();
            this.fetchBookingDetails();
            this.fetchStatusSlots("PENDING", "pendingSlots");
            this.fetchStatusSlots("WAITING_FOR_CHECK_IN", "waitingCheckInSlots");
            this.fetchStatusSlots("COMPLETED", "completedSlots");
            this.fetchStatusSlots("CANCELLED", "cancelledSlots");
        }

        const remainingAmount = this.calculateRemainingAmount();
        if (remainingAmount >= 0 && prevState.bookDisable !== false) {
            this.handleShowBookNow();
        } else if (remainingAmount < 0 && prevState.bookDisable !== true) {
            this.handleDisableBookNow();
        }
    }

    fetchCourts = () => {
        axiosInstance
            .get("/court/court-of-staff")
            .then((res) => {
                if (res.status === 200) {
                    const courtOfStaff = res.data;
                    const firstYardId = courtOfStaff?.yards?.[0]?.yardId || "";
                    const priceOfSingleSchedule = courtOfStaff?.priceList?.singleBookingPrice || 0;
                    this.setState(
                        {
                            courtOfStaff: res.data,
                            selectedYard: firstYardId,
                            priceOfSingleSchedule: priceOfSingleSchedule
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
        this.setState({ selectedYard: event.target.value, bookingDetailsRequestList: [], selectedSlots: {}, selectedDay: null });
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

    isPastTime(day, endTime, slot) {
        const currentTime = new Date();
        const [endHour, endMinute] = endTime.split(":").map(Number);
        const slotEndTime = new Date(currentTime);
        slotEndTime.setHours(endHour, endMinute, 0, 0);

        const { bookingDetailsList } = this.state;

        // Parse and format day to match the format used in bookingDetailsList
        const parsedDate = parse(day?.split(" ")[0], "dd/MM/yyyy", new Date());
        const formattedDayKey = format(parsedDate, "yyyy-MM-dd");

        // Check if there are any bookings for the formatted day
        if (!bookingDetailsList[formattedDayKey] || bookingDetailsList[formattedDayKey].length === 0) {
            return slotEndTime < currentTime;
        }

        // Find the matching bookingDetails based on slotId
        const matchedCheckIn = bookingDetailsList[formattedDayKey].find(
            (checkInDto) => checkInDto?.bookingDetails?.yardSchedule?.slot?.slotId === slot.slotId
        );
        if (!matchedCheckIn) {
            console.error("No matching checkInDto found for the given slot");
            return slotEndTime < currentTime;
        }

        // Get the status from the found bookingDetails
        const status = matchedCheckIn.bookingDetails.status;

        // Otherwise, check if the slotStartTime is in the past relative to currentTime
        return slotEndTime < currentTime;
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
            showModalSlotDetails: true,
        });
    };

    handleShowModalSlotDetails = (slot, day) => {
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
            this.setState({ showModalSlotDetails: true, selectedCustomer: customer, selectedSlotInfo: slot, bookingDetails: bookingDetailsFound });
        } else {
            console.error("No matching checkInDto found for the given slot");
        }
    };

    handleShowModalBookingForVisitors = () => {
        this.setState({ showModalBookingForVisitors: true })
    }

    handleCloseModalSlotDetails = () => {
        this.setState({ showModalSlotDetails: false, selectedCustomer: null });
    };

    handleCloseModalBookingForVisitors = () => {
        this.setState({ showModalBookingForVisitors: false });
    };

    handleCheckIn = async (detailId) => {
        try {
            const confirmResponse = await axiosInstance.post(`/booking-details/${detailId}/check-in`);
            if (confirmResponse.data.message === "Check-in thành công") {
                showAlert("success", "Thông báo", "Check-in thành công !", "top-end");
                this.handleCloseModalSlotDetails();
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
                this.handleCloseModalSlotDetails();
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

    handleSlotForVisitorClick = (slot, dayIndex) => {

        if (!this.isToday(this.state.daysOfWeek[dayIndex])) {
            showAlert('warning', 'Thông báo', 'Hãy chọn các slot trong ngày hôm nay', 'top')
            return;
        }

        const { selectedTab, selectedSlots, selectedDay, bookingDetailsRequestList, slots, selectedYard } = this.state;
        const dayKey = this.state.daysOfWeek[dayIndex];
        const newSelectedSlots = { ...selectedSlots };
        if (!newSelectedSlots[dayKey]) {
            newSelectedSlots[dayKey] = [];
        }

        if (selectedDay !== null && selectedDay !== dayIndex && !newSelectedSlots[dayKey].includes(slot)) {
            showAlert('warning', 'Thông báo', 'Hãy chọn các slot trong cùng ngày', 'top')
            return;
        }

        if (newSelectedSlots[dayKey].includes(slot)) {
            newSelectedSlots[dayKey] = newSelectedSlots[dayKey].filter((s) => s !== slot);
            if (newSelectedSlots[dayKey].length === 0) {
                delete newSelectedSlots[dayKey];
            }
            const updatedBookingDetailsRequestList = bookingDetailsRequestList.filter(
                (detail) => !(detail.slotId === slot && detail.date === dayKey.split(" ")[0])
            );
            this.setState({ bookingDetailsRequestList: updatedBookingDetailsRequestList });
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
                bookingDetailsRequestList: [...prevState.bookingDetailsRequestList, newBookingDetail],
            }));
        }

        this.setState(
            {
                selectedSlots: newSelectedSlots,
                selectedDay: Object.keys(newSelectedSlots).length > 0 ? dayIndex : null,
                errorMessage: "",
            },
            () => {
                console.log(this.state.bookingDetailsRequestList);
            }
        );

    };

    handleBooking = async (courtId) => {
        try {
            const bookingDetailsList = Array.from(this.state.bookingDetailsMap.entries()).map(([bookingDetail, realTimePrice]) => ({
                ...bookingDetail,
                realTimePrice,
            }));

            this.setState({ loading: true });

            const bookingResponse = await axiosInstance.post(`/booking/${courtId}/booking-for-vistors`, bookingDetailsList);
            this.setState({ loading: false });
            this.setState({ showModalBookingForVisitors: false })
            if (bookingResponse.data.message === "Đặt lịch thành công") {

                showAlert("success", "Thông báo", "Đặt lịch cho khách hàng thành công !", "top-end");
                this.handleCloseModalBookingForVisitors();
                this.fetchSlots();
                this.fetchBookingDetails();
                this.fetchStatusSlots("PENDING", "pendingSlots");
                this.fetchStatusSlots("WAITING_FOR_CHECK_IN", "waitingCheckInSlots");
                this.fetchStatusSlots("COMPLETED", "completedSlots");
                this.fetchStatusSlots("CANCELLED", "cancelledSlots");
                this.setState({ bookingDetailsRequestList: [], selectedSlots: {}, selectedDay: null })
            } else {
                showAlert('error', 'Thông báo', 'Đặt lịch cho khách hàng không thành công', 'top-end');
            }
        } catch (error) {
            console.error("Failed to booking:", error);
        }
    }

    handleCashChange = (event) => {
        const rawValue = event.target.value.replace(/[^0-9]/g, '');
        this.setState({
            cash: rawValue,
            isCashEdited: true
        });
    };

    handleShowBookNow = () => {
        this.setState({ bookDisable: false });
    }

    handleDisableBookNow = () => {
        this.setState({ bookDisable: true });
    }

    formatCurrency = (value) => {
        return Number(value).toLocaleString("vi-VN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    calculateTotalAmount = () => {
        const { bookingDetailsRequestList = [], slots = [], priceOfSingleSchedule } = this.state;
        
        return bookingDetailsRequestList.reduce((total, bookingDetail) => {
            const slot = slots.find(slot => slot.slotId === bookingDetail.slotId);
            if (slot) {
                const currentTime = this.getCurrentTime();
                const remainingMinutes = this.calculateRemainingTime(currentTime, slot.startTime, slot.endTime);
                const realTimePrice = this.calculateRealTimePrice(remainingMinutes, priceOfSingleSchedule, currentTime, slot.startTime, slot.endTime);
                return total + realTimePrice;
            }
            return total;
        }, 0);
    };
    

    calculateRemainingAmount = () => {
        const totalAmount = this.calculateTotalAmount();
        return this.state.cash - totalAmount;
    };

    calculateRemainingTime(currentTime, startTime, endTime) {
        const [currentHour, currentMinute] = currentTime.split(':').map(Number);
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        const endTimeInMinutes = endHour * 60 + endMinute;

        if (currentHour < startHour || (currentHour === startHour && currentMinute < startMinute)) {
            return null; // Return null if currentTime is greater than endTime
        }

        const diffInMinutes = endTimeInMinutes - currentTimeInMinutes;

        return diffInMinutes > 0 ? diffInMinutes : 0; // if time has passed, return 0
    }

    calculateRealTimePrice(remainingMinutes, pricePerSlot, currentTime, startTime, endTime) {
        const [currentHour, currentMinute] = currentTime.split(':').map(Number);
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const {priceOfSingleSchedule} = this.state;

        if (currentHour < startHour || (currentHour === startHour && currentMinute < startMinute)) {
            return priceOfSingleSchedule; // Return null if currentTime is greater than endTime
        }

        return (remainingMinutes / 60) * pricePerSlot;
    }

    getCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    updateBookingDetailsMap = () => {
        const { bookingDetailsRequestList, slots, priceOfSingleSchedule } = this.state;
        const bookingDetailsMap = new Map();

        bookingDetailsRequestList.forEach(bookingDetail => {
            const slot = slots.find(slot => slot.slotId === bookingDetail.slotId);
            const currentTime = this.getCurrentTime();
            const remainingMinutes = this.calculateRemainingTime(currentTime, slot.startTime, slot.endTime);
            const realTimePrice = this.calculateRealTimePrice(remainingMinutes, priceOfSingleSchedule, currentTime, slot.startTime, slot.endTime);
            
            bookingDetailsMap.set(bookingDetail, this.formatCurrency(realTimePrice));
        });

        this.setState({ bookingDetailsMap });
    };

    render() {
        const { showModalBookingForVisitors, bookingDetailsRequestList, priceOfSingleSchedule, cash, isCashEdited, bookingDetailsMap } = this.state;
        const { courtOfStaff } = this.state;
        const { daysOfWeek, selectedSlots, slots } = this.state;
        const selectedSlotDetails = Object.entries(selectedSlots).flatMap(([day, slotIds]) =>
            slotIds.map((slotId) => {
                const slot = slots.find((s) => s.slotId === slotId); // Tìm slot theo slotId
                return `${slot ? slot.slotName : "Unknown Slot"}`; // Kiểm tra nếu slot tồn tại
            })
        );

        {console.log("Map: ", bookingDetailsMap)}

        const { facilities } = this.state;

        if (!courtOfStaff) {
            return <div>Đang tải thông tin của cơ sở</div>;
        }

        const selectedSlotsList = this.state.bookingDetailsRequestList
            .reduce((acc, bookingDetail, index) => {
                const selectedSlot = this.state.slots.find((slot) => slot.slotId === bookingDetail.slotId);
                if (!selectedSlot) {
                    return acc;
                }
                const existingDate = acc.find((item) => item.date === bookingDetail.date);
                if (existingDate) {
                    existingDate.slots.push({
                        name: selectedSlot.slotName,
                        time: `${selectedSlot.startTime} - ${selectedSlot.endTime}`
                    });
                } else {
                    acc.push({
                        date: bookingDetail.date,
                        slots: [{
                            name: selectedSlot.slotName,
                            time: `${selectedSlot.startTime} - ${selectedSlot.endTime}`
                        }],
                    });
                }
                return acc;
            }, [])
            .map((item, index) => (
                <div key={index} className="staff-page-selected-slot">
                    <FaCalendarAlt className="staff-page-slot-icon" />
                    <div className="staff-page-slot-info">
                        <strong>Ngày:</strong> {item.date}
                        <div className="staff-page-slot-details">
                            {item.slots.map((slot, idx) => (
                                <div key={idx}>
                                    <FaClock className="staff-page-slot-icon" />
                                    <span><strong>Slot:</strong> {slot.name} ({slot.time})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ));

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
                                        <div className="btn slot-time selected" style={{ width: "15%", height: "40px" }}>
                                            <b>Đang chọn</b>
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
                                                                            className={`slot-time ${selectedSlots[daysOfWeek[dayIndex]]?.includes(slot.slotId)
                                                                                ? "selected"
                                                                                : ""
                                                                                }
                                                                                ${this.isWaitingCheckInSlot(daysOfWeek[dayIndex], slot.slotId)
                                                                                    ? "waiting-check-in"
                                                                                    : ""
                                                                                }
                                                                        ${this.isToday(daysOfWeek[dayIndex]) &&
                                                                                    !this.isWaitingCheckInSlot(daysOfWeek[dayIndex], slot.slotId) &&
                                                                                    this.isPastTime(daysOfWeek[dayIndex], slot.endTime, slot)
                                                                                    ? "pastTime"
                                                                                    : ""
                                                                                }
                                                                        ${this.isCompletedSlot(daysOfWeek[dayIndex], slot.slotId) ? "completed" : ""}
                                                                        ${this.isPendingSlot(daysOfWeek[dayIndex], slot.slotId) ? "pending" : ""}`}
                                                                            onClick={() => {
                                                                                if (
                                                                                    this.isWaitingCheckInSlot(daysOfWeek[dayIndex], slot.slotId) ||
                                                                                    this.isCompletedSlot(daysOfWeek[dayIndex], slot.slotId) ||
                                                                                    this.isPendingSlot(daysOfWeek[dayIndex], slot.slotId)
                                                                                ) {
                                                                                    this.handleShowModalSlotDetails(slot, daysOfWeek[dayIndex]);
                                                                                } else {
                                                                                    this.handleSlotForVisitorClick(slot.slotId, dayIndex);
                                                                                }
                                                                            }}
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
                                    {selectedSlotsList.length > 0 ? (
                                        <div className="staff-page-selected-slots">
                                            <button type="button" onClick={this.handleShowModalBookingForVisitors} className="btn btn-primary staff-page-book-now">
                                                Đặt lịch cho khách
                                            </button>
                                            {selectedSlotsList.length > 0 ? selectedSlotsList : <div>Chưa có slot nào được chọn cho khách</div>}
                                            <div className="staff-page-slot-info">
                                                <div className="staff-page-slot-details">
                                                    <div>
                                                        <FaMoneyBill className="staff-page-price-icon" />
                                                        <span><strong>Giá:</strong> {priceOfSingleSchedule.toLocaleString("vi-VN")} VND/Slot</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : ""}
                                </div>
                            </div>
                        </div>
                    </form>
                    {/** Modal thông tin chi tiết slot */}
                    <Modal show={this.state.showModalSlotDetails} onHide={() => this.setState({ showModalSlotDetails: false })} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Thông tin check-in</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <b>Khách hàng: </b> {this.state.selectedCustomer?.fullName ? (this.state.selectedCustomer?.fullName) : 'Khách vãng lai'} <br />
                            <b>Email: </b> {this.state.selectedCustomer?.email ? (this.state.selectedCustomer?.email) : 'Không có'} <br />
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
                                    <Button variant="primary" style={{ padding: '10px' }} onClick={() => this.handleCheckIn(this.state.bookingDetails?.detailId)}>
                                        Check-in
                                    </Button>
                                )}
                            <Button
                                className="p-2"
                                variant="secondary"
                                style={{ alignContent: "center" }}
                                onClick={() => this.setState({ showModalSlotDetails: false })}
                            >
                                Đóng
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/** Modal thông tin đặt lịch cho khách vãng lai */}
                    <Modal show={showModalBookingForVisitors} onHide={() => this.setState({ showModalBookingForVisitors: false })} centered size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>Chi tiết đơn</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {bookingDetailsRequestList.length > 0 && (
                                <div className="booking-modal-content">
                                    <table className="table booking-table">
                                        <thead>
                                            <tr>
                                                <th>Slot</th>
                                                <th>Thời gian</th>
                                                <th>Giá (VND)</th>
                                                <th>Thời gian thực</th>
                                                <th>Số phút</th>
                                                <th>Giá (VND)</th>
                                                <th>Sân</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookingDetailsRequestList
                                                .sort((a, b) => {
                                                    const slotA = slots.find(slot => slot.slotId === a.slotId);
                                                    const slotB = slots.find(slot => slot.slotId === b.slotId);
                                                    return slotA.slotName.localeCompare(slotB.slotName);
                                                })
                                                .map((bookingDetail, index) => {
                                                    const slot = slots?.find(slot => slot.slotId === bookingDetail.slotId);
                                                    const yard = courtOfStaff?.yards?.find(yard => yard.yardId === bookingDetail.yardId);
                                                    const currentTime = this.getCurrentTime();
                                                    const remainingMinutes = this.calculateRemainingTime(currentTime, slot.startTime, slot.endTime);
                                                    const realTimePrice = this.calculateRealTimePrice(remainingMinutes, priceOfSingleSchedule, currentTime, slot.startTime, slot.endTime);

                                                    return (
                                                        <tr key={index}>
                                                            <td>{slot.slotName}</td>
                                                            <td>{slot.startTime} - {slot.endTime}</td>
                                                            <td className="price-cell">{this.formatCurrency(priceOfSingleSchedule)}</td>
                                                            <td>
                                                                {currentTime > slot.startTime && currentTime < slot.endTime ?
                                                                    `${currentTime} - ${slot.endTime}` :
                                                                    'N/A'}
                                                            </td>
                                                            <td>
                                                                {remainingMinutes != null ? `${remainingMinutes} phút` : 'N/A'}
                                                            </td>
                                                            <td className="price-cell">{this.formatCurrency(realTimePrice)}</td>
                                                            <td>{yard.yardName}</td>
                                                        </tr>
                                                    );
                                                })}
                                            <tr>
                                                <td>
                                                    <h5><b>Tổng tiền:</b></h5>
                                                </td>
                                                <td colSpan="4"></td>
                                                <td className="total-amount">
                                                    <h5>{this.formatCurrency(this.calculateTotalAmount())}</h5>
                                                </td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <h5><b>Tiền mặt:</b></h5>
                                                </td>
                                                <td colSpan="4"></td>
                                                <td className="input-cell">
                                                    <input
                                                        type="text"
                                                        value={isCashEdited ? this.formatCurrency(cash) : ''}
                                                        onChange={this.handleCashChange}
                                                        placeholder="Nhập số tiền"
                                                        className="cash-input"
                                                    />
                                                </td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <h5><b>Số tiền thừa:</b></h5>
                                                </td>
                                                <td colSpan="4"></td>
                                                <td className="remaining-amount">
                                                    <h5>{this.calculateRemainingAmount() >= 0 ? this.formatCurrency(this.calculateRemainingAmount()) : 'N/A'}</h5>
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="primary"
                                style={{ padding: '10px' }}
                                disabled={this.state.bookDisable}
                                onClick={() => this.handleBooking(this.state.courtOfStaff.courtId, this.state.bookingDetailsRequestList)}
                            >
                                Xác nhận
                            </Button>
                            <Button
                                className="p-2"
                                variant="secondary"
                                onClick={() => this.setState({ showModalBookingForVisitors: false, cash: 0 })}
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
