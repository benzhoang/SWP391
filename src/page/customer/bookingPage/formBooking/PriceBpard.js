import React, { Component } from "react";
import "./slot.css";
import { FaDollarSign, FaCalendarDay, FaCalendarCheck } from 'react-icons/fa';
import { Card, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';

export default class PriceBoard extends Component {
    render() {
        const { priceBoard } = this.props;
        console.log("PriceBoard props:", priceBoard); // Check the data being passed in

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="price-board-container"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="modalPriceBoard">
                                Giá Các Slot Theo Dạng Lịch
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {priceBoard ? (
                                <div className="price-cards">
                                    <motion.div
                                        whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                                        whileTap={{ scale: 0.95 }}
                                        className="price-card-container"
                                    >
                                        <Card className="price-card single-booking">
                                            <Card.Body>
                                                <Card.Title>
                                                    <FaDollarSign className="icon" /> Giá Lịch Đơn (VND/Slot)
                                                </Card.Title>
                                                <Card.Text className="price-text">
                                                    <strong>{priceBoard?.singleBookingPrice?.toLocaleString("vi-VN")} VND</strong>
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                                        whileTap={{ scale: 0.95 }}
                                        className="price-card-container"
                                    >
                                        <Card className="price-card fixed-booking">
                                            <Card.Body>
                                                <Card.Title>
                                                    <FaCalendarDay className="icon" /> Giá Lịch Cố Định (VND/Slot)
                                                </Card.Title>
                                                <Card.Text className="price-text">
                                                    <strong>{priceBoard?.fixedBookingPrice?.toLocaleString("vi-VN")} VND</strong>
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                                        whileTap={{ scale: 0.95 }}
                                        className="price-card-container"
                                    >
                                        <Card className="price-card flexible-booking">
                                            <Card.Body>
                                                <Card.Title>
                                                    <FaCalendarCheck className="icon" /> Giá Lịch Linh Hoạt (VND/Giờ)
                                                </Card.Title>
                                                <Card.Text className="price-text">
                                                    <strong>{priceBoard?.flexibleBookingPrice?.toLocaleString("vi-VN")} VND</strong>
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </motion.div>
                                </div>
                            ) : (
                                <p className="no-info">Không Có Thông Tin Bảng Giá.</p>
                            )}
                        </div>
                        <div className="modal-footer">
                            <Button variant="primary" data-bs-dismiss="modal">
                                Đóng
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }
}
