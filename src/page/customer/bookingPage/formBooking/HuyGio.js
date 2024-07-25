import React, { useEffect, useState } from "react";
import "../booking.css";
import axiosInstance from "../../../../config/axiosConfig";
import { alert } from "../../../../utils/alertUtils";
import axios from "axios";

const HuyGio = ({ priceList, courtId, onHoursCancel }) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;

    const [expirationDate, setExpirationDate] = useState('');
    const [flexibleBookings, setFlexibleBookings] = useState([]);
    const [availableHours, setAvailableHours] = useState(0);
    const [usedHours, setUsedHours] = useState(0);
    const [loading, setLoading] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));
    const price = priceList ? priceList.flexibleBookingPrice : 0;

    useEffect(() => {
        const lastDay = new Date(currentDate.getFullYear(), currentMonth, 0);
        const formattedLastDay = `${lastDay.getDate()}/${currentMonth}/${lastDay.getFullYear()} 23:59:59`;
        setExpirationDate(formattedLastDay);
    }, [currentMonth]);

    useEffect(() => {
        if (courtId) {
            fetchFlexibleBookings();
        }
    }, [courtId]);

    useEffect(() => {
        // Update available and used hours whenever flexibleBookings changes
        calculateAvailableAndUsedHours(flexibleBookings);
    }, [flexibleBookings]);

    const fetchFlexibleBookings = () => {
        axiosInstance
            .get(`/booking/${courtId}/bookings/flexible`)
            .then((response) => {
                setFlexibleBookings(response.data);
            })
            .catch((error) => {
                console.error("There was an error fetching the flexible bookings !", error);
            });
    };

    const calculateAvailableAndUsedHours = (bookings) => {
        if (!bookings || bookings.length === 0) {
            setAvailableHours(0);
            setUsedHours(0);
            return;
        }

        let totalAvailableHours = 0;
        let totalUsedHours = 0;

        bookings.forEach((booking) => {
            totalAvailableHours += booking.flexibleBooking.availableHours;
            totalUsedHours += booking.flexibleBooking.usedHours;
        });

        setAvailableHours(totalAvailableHours);
        setUsedHours(totalUsedHours);
    };

    const calculateTotalRefundAmount = () => {
        let totalRefundAmount = 0;

        for (const booking of flexibleBookings) {
            const refundAmount = booking?.flexibleBooking.availableHours * booking?.flexibleBooking.pricePerHour;
            totalRefundAmount += refundAmount;
        }

        return totalRefundAmount;
    };

    const getExchangeRate = async () => {
        const API_KEY = 'a2ebea95ae9c3ce5ae387b15';
        const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

        try {
            const response = await axios.get(BASE_URL);
            if (response.status === 200) {
                const exchangeRates = response.data.conversion_rates;
                // Lấy tỷ giá VND
                const exchangeRateVND = exchangeRates.VND;
                return exchangeRateVND;
            } else {
                console.error('Failed to fetch exchange rates:', response.statusText);
                return null;
            }
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            return null;
        }
    };

    const handleCancelAndTransferHours = async (transferType, usedPercentage) => {
        try {
            let response;

            if (transferType === 'transfer') {
                setLoading(true);
                response = await axiosInstance.post(`/booking/${courtId}/flexible-bookings/transfer-next-month`);
                setLoading(false);
                if (response.data.message === 'Transfer hours to next month successful') {
                    alert('success', 'Thông báo', `Đã chuyển ${availableHours} giờ còn lại vào tháng ${currentMonth + 1} thành công !`, 'center');
                    onHoursCancel();
                    fetchFlexibleBookings();
                }
            } else if (transferType === 'cancel') {

                if (usedPercentage < 50) {
                    alert('error', 'Thông báo', 'Bạn chưa sử dụng đủ 50% số giờ đã đăng ký. Vui lòng sử dụng đủ 50% số giờ đã đăng ký để được hủy !', 'center');
                    return;
                }

                const exchangeRate = await getExchangeRate();
                if (!exchangeRate) {
                    throw new Error('Failed to get exchange rate');
                }

                const bookings = flexibleBookings;
                const saleIdAndRefundAmount = {};

                bookings.forEach(booking => {
                    const { payment, flexibleBooking } = booking;
                    const { saleId } = payment;
                    const { availableHours, pricePerHour } = flexibleBooking;

                    saleIdAndRefundAmount[saleId] = ((availableHours * pricePerHour) / exchangeRate).toString();
                });
                setLoading(true);
                const refundResponse = await axiosInstance.post(`/paypal/refund/flexible-booking`, saleIdAndRefundAmount);

                if (refundResponse.data.message === 'Refund successful') {
                    response = await axiosInstance.post(`/booking/${courtId}/flexible-bookings/cancel`);
                    setLoading(false);
                    if (response.data.message === 'Cancel hours successful') {
                        alert('success', 'Thông báo', `Đã hủy ${availableHours} giờ còn lại thành công ! Số tiền đã được hoàn lại vào tài khoản Paypal của bạn.`, 'center');
                        onHoursCancel();
                        fetchFlexibleBookings();
                    }
                } else {
                    throw new Error('Refund unsuccessful');
                }
            } else {
                throw new Error('Invalid transfer type');
            }
        } catch (error) {
            console.error('Error handling cancel and transfer:', error);
            throw error; // Handle or propagate the error as necessary
        }
    };

    // Calculate availability percentage
    const availabilityPercentage = availableHours === 0 && usedHours === 0 ? 0 : Math.floor((availableHours / (availableHours + usedHours)) * 100);
    const usedPercentage = availableHours === 0 && usedHours === 0 ? 0 : Math.floor((usedHours / (availableHours + usedHours)) * 100);
    const totalRefundAmount = calculateTotalRefundAmount();
    return (
        <div className="nap-gio-form">
            <h2>Hủy và chuyển đổi giờ</h2>
            <form>
                <div className="form-group">
                    <label htmlFor="customerName">Khách hàng:</label>
                    <input
                        id="customerName"
                        type="text"
                        value={user?.fullName || ''}
                        readOnly
                        className="input-field"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="customerEmail">Email:</label>
                    <input
                        id="customerEmail"
                        type="email"
                        value={user?.email || ''}
                        readOnly
                        className="input-field"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="expirationDate">Ngày hết hạn:</label>
                    <input
                        id="expirationDate"
                        type="text"
                        value={expirationDate}
                        readOnly
                        className="input-field"
                    />
                </div>
                <div className="form-group">
                    <div className="input-group">
                        <div className="input-group-item">
                            <label htmlFor="hours">Đang có: <b style={{ color: 'green' }}>{availabilityPercentage}%</b></label>
                            <input
                                id="hours"
                                type="number"
                                min={0}
                                value={availableHours}
                                className="input-field"
                                readOnly
                            />
                        </div>
                        <div className="input-group-item">
                            <label htmlFor="hours">Đã sử dụng: <b style={{ color: 'red' }}>{usedPercentage}%</b></label>
                            <input
                                id="hours"
                                type="number"
                                min={0}
                                value={usedHours}
                                className="input-field"
                                readOnly
                            />
                        </div>
                        <div className="input-group-item">
                            <label htmlFor="hours">Tổng giờ: <b style={{ color: 'blue' }}>100%</b></label>
                            <input
                                id="hours"
                                type="number"
                                min={0}
                                value={availableHours + usedHours}
                                className="input-field"
                                readOnly
                            />
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <div className="input-group-item">
                        <label htmlFor="price">Hoàn lại (nếu hủy giờ):</label>
                        <div className="input-text" style={{ color: 'green' }}><b>{totalRefundAmount.toLocaleString('vi-VN')} VND</b></div>
                    </div>
                </div>
                <button className="submit-button" type="button" onClick={() => handleCancelAndTransferHours('cancel', usedPercentage)}>Hủy giờ</button>
                <button className="submit-button" type="button" onClick={() => handleCancelAndTransferHours('transfer')}>Chuyển đổi giờ sang tháng {currentMonth + 1}</button>
            </form>
        </div>
    );
};

export default HuyGio;
