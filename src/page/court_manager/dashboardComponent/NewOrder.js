import React, { useEffect, useState } from "react";
import axiosInstance from "../../../config/axiosConfig";
import { showAlert } from "../../../utils/alertUtils";
import { handleTokenError } from "../../../utils/tokenErrorHandle";

const NewOrder = ({ setOrderCount, setTotalRevenue }) => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = () => {
        axiosInstance
            .get("/booking/bookings-of-courts")
            .then((res) => {
                if (res.status === 200) {
                    const ordersData = res.data;
                    const sortedOrders = sortOrdersByDate(ordersData);
                    priceOrderByMonth(sortedOrders);
                    const newOrder = sortedOrders.filter((or) => or.statusEnum === "Đang chờ xử lý");

                    setOrders(newOrder);
                } else {
                    showAlert("error", "Lỗi !", "Không lấy được dữ liệu", "top-end");
                }
            })
            .catch((error) => {
                if (error.response && error.response.status === 401 && error.response.data.message === "Token không hợp lệ hoặc đã hết hạn.") {
                    handleTokenError();
                }
            });
    };

    const sortOrdersByDate = (ordersData) => {
        let allOrders = [];
        Object.keys(ordersData).forEach((courtId) => {
            allOrders = [...allOrders, ...ordersData[courtId]];
        });

        return allOrders.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
    };

    // const getLatestOrders = (sortedOrders) => {
    //     return sortedOrders.slice(0, 5);
    // };

    const priceOrderByMonth = (orders) => {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        let totalRevenue = 0;
        let totalOrders = 0;

        orders.forEach((order) => {
            const [day, month, year] = order.bookingDate.split(" ")[0].split("/").map(Number);
            const bookingDate = new Date(year, month - 1, day);
            const bookingMonth = bookingDate.getMonth() + 1;
            const bookingYear = bookingDate.getFullYear();

            if (bookingMonth === currentMonth && bookingYear === currentYear && order.statusEnum !== "Đã hủy") {
                totalRevenue += order.totalPrice;
                totalOrders += 1;
            }
        });

        setTotalRevenue(totalRevenue);
        setOrderCount(totalOrders);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Đang chờ check-in":
                return "bg-warning text-white";
            case "Đã hủy":
                return "bg-danger text-white";
            case "Đã hoàn thành":
                return "bg-success text-white";
            case "Đang chờ xử lý":
                return "bg-primary text-white";
            default:
                return "";
        }
    };

    return (
        <div className="bookingListItem">
            <div className="overflow-x-auto">
                <table className="table">
                    <thead className="table-light">
                        <tr>
                            <th>Mã đơn</th>
                            <th className="text-start">Khách hàng</th>
                            <th className="text-start">Loại đặt sân</th>
                            <th>Ngày đặt</th>
                            <th>Trạng thái</th>
                            <th>Tổng tiền</th>
                            <th className="text-start">Sân</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.bookingId}>
                                <td className="text-center">{order.bookingId}</td>
                                <td>{order.customer.fullName}</td>
                                <td>{order.bookingType}</td>
                                <td className="text-center">{order.bookingDate}</td>
                                <td>
                                    <div className={"rounded-pill py-1 text-center " + getStatusColor(order.statusEnum)}>{order.statusEnum}</div>
                                </td>
                                <td className="text-center">{order.totalPrice}</td>
                                <td>{order.court.courtName}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NewOrder;
