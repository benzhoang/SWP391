import React, { useEffect, useState } from "react";
import "../booking.css";
import axiosInstance from "../../../../config/axiosConfig";
import Spinner from "../../../../components/snipper";

const NapGio = ({ priceList, courtId }) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;

    const [hours, setHours] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [priceColor, setPriceColor] = useState('#333');
    const [loading, setLoading] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));
    const price = priceList ? priceList.flexibleBookingPrice : 0;

    useEffect(() => {
        const lastDay = new Date(currentDate.getFullYear(), currentMonth, 0);
        const formattedLastDay = `${lastDay.getDate()}/${currentMonth}/${lastDay.getFullYear()} 23:59:59`;
        setExpirationDate(formattedLastDay);
    }, [currentMonth]);

    useEffect(() => {
        if (hours !== '') {
            const calculatedPrice = hours * price;
            setTotalPrice(calculatedPrice);
            setPriceColor(calculatedPrice > 0 ? '#4CAF50' : '#333');
        } else {
            setTotalPrice(0);
            setPriceColor('#333');
        }
    }, [hours, price]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        try {
            setLoading(true);
            const response = await axiosInstance.post(`/booking/${courtId}/flexible/${hours}`);
            setLoading(false);
            localStorage.setItem("booking", JSON.stringify(response.data));
            window.location.href = "/detailBooking";
        } catch (error) {
            console.error("There was an error when booking!", error);
        }
    };

    return (
        <div className="nap-gio-form">
            {loading && <Spinner />}
            <h2>Đăng ký tổng số giờ chơi tháng {currentMonth}</h2>
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
                            <label htmlFor="hours">Số giờ:</label>
                            <input
                                id="hours"
                                type="number"
                                min={0}
                                value={hours}
                                onChange={(e) => setHours(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>
                        <div className="input-group-item">
                            <label htmlFor="price">Số tiền:</label>
                            <div className="input-text" style={{ color: priceColor }}><b>{totalPrice.toLocaleString('vi-VN')} VND</b></div>
                        </div>
                    </div>
                </div>
                <button className="submit-button" onClick={handleSubmit}>Xác nhận</button>
            </form>
        </div>
    );
};

export default NapGio;
