import React, { Component } from "react";
import axiosInstance from "../../config/axiosConfig";
import { showAlert, showConfirmAlert } from "../../utils/alertUtils";
import { handleTokenError } from "../../utils/tokenErrorHandle";

export default class Slot extends Component {
    state = {
        slots: [],
        slot: {
            slotId: "",
            slotName: "",
            startTime: "",
            endTime: "",
            price: "",
        },
        currentPage: 1,
        slotsPerPage: 5,
    };

    componentDidMount() {
        this.fetchSlot();
    }

    fetchSlot = () => {
        axiosInstance
            .get("/time-slot/findAllSlot")
            .then((res) => {
                if (res.status === 200) {
                    this.setState({ slots: res.data });
                } else {
                    this.setState({ slots: [] });
                    showAlert("error", "Lỗi !", "Không lấy được dữ liệu", "top-end");
                    console.error("Response không thành công:", res.status);
                }
            })
            .catch((error) => {
                throw error;
            });
    };

    handleAddSlot = () => {
        const { slot } = this.state;
        const slotData = {
            slotName: slot.slotName,
            startTime: slot.startTime,
            endTime: slot.endTime,
            price: slot.price,
        };
        axiosInstance
            .post("time-slot/createSlot", slotData, {
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then((res) => {
                if (res.status === 200) {
                    this.fetchSlot();
                    this.setState({
                        slot: {
                            slotId: "",
                            slotName: "",
                            startTime: "",
                            endTime: "",
                            price: "",
                        },
                    });
                    showAlert("success", "", "Thêm slot thành công", "top-end");
                } else {
                    showAlert("error", "Lỗi !", "Thêm slot không thành công", "top-end");
                    console.error("Response không thành công:", res.status);
                }
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    if (error.response.data.message === "Slot với tên này đã có trong danh sách.") {
                        showAlert("error", "Lỗi!", "Slot với tên này đã có trong danh sách.", "top-end");
                    }
                }
            });
    };

    handleUpdateSlot = () => {
        axiosInstance
            .put("time-slot/updateSlot", this.state.slot)
            .then((res) => {
                if (res.status === 200) {
                    this.fetchSlot();
                    this.setState({
                        slot: {
                            slotId: "",
                            slotName: "",
                            startTime: "",
                            endTime: "",
                            price: "",
                        },
                    });
                    showAlert("success", "", "Chỉnh sửa slot thành công", "top-end");
                } else {
                    showAlert("error", "Lỗi !", "Chỉnh sửa slot không thành công", "top-end");
                    console.error("Response không thành công:", res.status);
                }
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    if (error.response.data.message === "Slot với tên này đã có trong danh sách.") {
                        showAlert("error", "Lỗi!", "Slot với tên này đã có trong danh sách.", "top-end");
                    }
                }
                this.handleRequestError(error);
            });
    };

    handleDeleteSlot = (slotId) => {
        showConfirmAlert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa slot này không ?", "Xóa", "center").then((result) => {
            if (result.isConfirmed) {
                axiosInstance
                    .delete(`/time-slot/deleteSlot/${slotId}`)
                    .then((res) => {
                        if (res.status === 200) {
                            this.fetchSlot();
                            showAlert("success", "", "Đã xóa slot thành công", "top-end");
                        } else {
                            showAlert("error", "", "Xóa slot không thành công", "top-end");
                        }
                    })
                    .catch((error) => {
                        throw error;
                    });
            }
        });
    };
    handleInputChange = (event) => {
        const { name, value } = event.target;
        this.setState((prevState) => ({
            slot: {
                ...prevState.slot,
                [name]: value,
            },
        }));
    };

    handleRequestError = (error) => {
        console.error("Lỗi từ server:", error.response ? error.response.data : error);
    };

    handlePageChange = (number) => {
        this.setState({ currentPage: number });
    };

    render() {
        const { slots, currentPage, slotsPerPage } = this.state;

        // Tính toán các slot hiện tại
        const indexOfLastSlot = currentPage * slotsPerPage;
        const indexOfFirstSlot = indexOfLastSlot - slotsPerPage;
        const currentSlots = slots.slice(indexOfFirstSlot, indexOfLastSlot);

        // Tạo các nút phân trang
        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(slots.length / slotsPerPage); i++) {
            pageNumbers.push(i);
        }

        return (
            <div>
                <div className="row pt-5">
                    <div className="col-md-8">
                        <button
                            id="btnThemSlot"
                            className="btn btn-primary w-25"
                            data-bs-toggle="modal"
                            data-bs-target="#addNewSlot"
                            onClick={() =>
                                this.setState({
                                    slot: {
                                        slotName: "",
                                        startTime: "",
                                        endTime: "",
                                        price: "",
                                    },
                                })
                            }
                        >
                            <i className="fa fa-plus mr-1" />
                            Thêm Mới
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="table table-hover mt-2">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Mã slot</th>
                                <th>Tên</th>
                                <th>Thời gian</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentSlots.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center">
                                        Danh sách slot trống
                                    </td>
                                </tr>
                            ) : (
                                currentSlots.map((slot, index) => (
                                    <tr className="" key={slot.slotId}>
                                        <td className="text-center">{indexOfFirstSlot + index + 1}</td>
                                        <td className="text-center">{slot.slotId}</td>
                                        <td className="text-center">{slot.slotName}</td>
                                        <td className="text-center">{`${slot.startTime} - ${slot.endTime}`}</td>
                                        <td className="d-flex btn-action">
                                            <button
                                                className="btn btn-warning mr-2"
                                                data-bs-toggle="modal"
                                                data-bs-target="#updateSlot"
                                                onClick={() => this.setState({ slot: slot, isDetailView: false })}
                                            >
                                                <i className="fa fa-pen-to-square"></i>
                                            </button>
                                            <button className="btn btn-danger" onClick={() => this.handleDeleteSlot(slot.slotId)}>
                                                <i className="fa fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <nav className="d-flex justify-content-center">
                    <ul className="pagination">
                        {pageNumbers.map((number) => (
                            <li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}>
                                <button onClick={() => this.handlePageChange(number)} className="page-link m-0">
                                    {number}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="modal fade" id="addNewSlot" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">
                                    Thêm slot
                                </h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="form-group">
                                        <label>Tên slot</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="slotName"
                                            value={this.state.slot.slotName}
                                            onChange={this.handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Thời gian bắt đầu</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            name="startTime"
                                            value={this.state.slot.startTime}
                                            onChange={this.handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Thời gian kết thúc</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            name="endTime"
                                            value={this.state.slot.endTime}
                                            onChange={this.handleInputChange}
                                            required
                                        />
                                    </div>
                                    {/* <div className="form-group">
                                        <label>Giá slot</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="price"
                                            value={this.state.slot.price}
                                            onChange={this.handleInputChange}
                                            required
                                        />
                                    </div> */}
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                    Đóng
                                </button>
                                <button type="button" className="btn btn-primary" onClick={this.handleAddSlot}>
                                    Lưu lại
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="updateSlot" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">
                                    Chỉnh sửa slot
                                </h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="form-group">
                                        <label>Tên slot</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="slotName"
                                            value={this.state.slot.slotName}
                                            onChange={this.handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Thời gian bắt đầu</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            name="startTime"
                                            value={this.state.slot.startTime}
                                            onChange={this.handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Thời gian kết thúc</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            name="endTime"
                                            value={this.state.slot.endTime}
                                            onChange={this.handleInputChange}
                                            required
                                        />
                                    </div>
                                    {/* <div className="form-group">
<label>Giá slot</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="price"
                                            value={this.state.slot.price}
                                            onChange={this.handleInputChange}
                                            required
                                        />
                                    </div> */}
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                    Đóng
                                </button>
                                <button type="button" className="btn btn-primary" onClick={this.handleUpdateSlot}>
                                    Lưu lại
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
