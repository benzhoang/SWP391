import React, { Component } from "react";
import "./slot.css";
export default class PriceBpard extends Component {
    render() {
        const { priceBoard } = this.props;
        console.log("PriceBpard props:", priceBoard); // Kiểm tra dữ liệu được truyền vào

        return (
            <div>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="modalPriceBoard">
                                Bảng giá các slot theo dạng lịch
                            </h5>
                            <button type="button" className="btn-close m-0" data-bs-dismiss="modal" aria-label="Close" />
                        </div>
                        <div className="modal-body modalPriceBoard">
                            {priceBoard ? (
                                <div>
                                    <div className="d-flex justify-between">
                                        <div>Giá đặt đơn: </div>
                                        <strong>{priceBoard?.singleBookingPrice?.toLocaleString("vi-VN")} VND</strong>
                                    </div>
                                    <div className="d-flex justify-between">
                                        <div>Giá đặt cố định: </div>
                                        <strong>{priceBoard?.fixedBookingPrice?.toLocaleString("vi-VN")} VND</strong>
                                    </div>
                                    <div className="d-flex justify-between">
                                        <div>Giá đặt linh hoạt:</div>
                                        <strong>{priceBoard?.flexibleBookingPrice?.toLocaleString("vi-VN")} VND</strong>
                                    </div>
                                </div>
                            ) : (
                                <p>Không có thông tin bảng giá.</p>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary m-0 p-2" data-bs-dismiss="modal">
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
