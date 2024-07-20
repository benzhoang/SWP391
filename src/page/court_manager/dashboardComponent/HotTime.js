import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import axiosInstance from "../../../config/axiosConfig";
import { handleTokenError } from "../../../utils/tokenErrorHandle";

const HotTime = () => {
    const [orders, setOrders] = useState([]);
    const [dailyRevenue, setDailyRevenue] = useState(new Array(7).fill(0));

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        calculateDailyRevenue();
    }, [orders]);

    const fetchOrders = () => {
        axiosInstance
            .get("/booking/bookings-of-courts")
            .then((res) => {
                if (res.status === 200) {
                    const fetchedOrders = Object.values(res.data).flat();
                    setOrders(fetchedOrders);
                } else {
                    console.error("Không lấy được dữ liệu");
                }
            })
            .catch((error) => {
                if (error.response && error.response.status === 401 && error.response.data.message === "Token không hợp lệ hoặc đã hết hạn.") {
                    handleTokenError();
                }
                console.error("Lỗi fetch orders:", error);
            });
    };

    const calculateDailyRevenue = () => {
        const revenuePerDay = new Array(7).fill(0);
        orders.forEach((order) => {
            const [day, month, year] = order.bookingDate.split(" ")[0].split("/").map(Number);
            const bookingDate = new Date(year, month - 1, day);
            const dayOfWeek = bookingDate.getDay();
            revenuePerDay[dayOfWeek] += order.totalPrice;
        });
        setDailyRevenue(revenuePerDay);
    };

    const data = {
        labels: ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"],
        datasets: [
            {
                label: "Doanh thu",
                data: dailyRevenue,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderWidth: 2,
                pointBackgroundColor: "rgba(75, 192, 192, 1)",
                pointBorderColor: "#fff",
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Doanh thu hàng tuần",
            },
        },
    };

    return (
        <div className="overscroll-x-auto">
            <div className="chart-container" style={{ width: "100%", height: "100%" }}>
                <Line data={data} options={options} />
            </div>
        </div>
    );
};

export default HotTime;
