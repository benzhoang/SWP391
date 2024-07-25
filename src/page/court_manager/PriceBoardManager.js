import React, { Component } from "react";
import { showAlert, showConfirmAlert } from "../../utils/alertUtils";
import axiosInstance from "../../config/axiosConfig";
import { handleTokenError } from "../../utils/tokenErrorHandle";

export default class PriceBoardManager extends Component {
    state = {
        priceBoard: [],
        courts: [],
        selectedCourtId: "",
        priceListId: "",
        currentPage: 1,
        boardsPerPage: 3,
        showModal: false,
        editMode: false,
        newPriceBoard: {
            priceListId: "",
            singleBookingPrice: "",
            fixedBookingPrice: "",
            flexibleBookingPrice: "",
        },
    };

    fetchPrice = () => {
        axiosInstance
            .get("/price-list/")
            .then((response) => {
                if (response.status === 200) {
                    this.setState({ priceBoard: response.data });
                } else {
                    this.setState({ priceBoard: [] });
                    showAlert("error", "Lỗi !", "Không lấy được dữ liệu", "top-end");
                    console.error("Response không thành công:", response.status);
                }
            })
            .catch((error) => {
                if (error.response && error.response.status === 401 && error.response.data.message === "Token không hợp lệ hoặc đã hết hạn.") {
                    handleTokenError();
                }
                this.handleRequestError(error);
            });
    };

    fetchCourtOfOwner = () => {
        axiosInstance
            .get("/court/courts-of-owner")
            .then((response) => {
                if (response.status === 200) {
                    this.setState({ courts: response.data });
                } else {
                    this.setState({ courts: [] });
                    showAlert("error", "Lỗi !", "Không lấy được dữ liệu", "top-end");
                    console.error("Response không thành công:", response.status);
                }
            })
            .catch((error) => {
                if (error.response && error.response.status === 401 && error.response.data.message === "Token không hợp lệ hoặc đã hết hạn.") {
                    handleTokenError();
                }
                this.handleRequestError(error);
            });
    };

    componentDidMount() {
        this.fetchPrice();
        this.fetchCourtOfOwner();
    }

    handleRequestError = (error) => {
        console.error("Request error:", error);
        showAlert("error", "Lỗi !", "Có lỗi xảy ra khi lấy dữ liệu", "top-end");
    };

    handleAddPriceBoard = () => {
        this.setState({
            showModal: true,
            editMode: false,
            newPriceBoard: {
                priceListId: "",
                singleBookingPrice: "",
                fixedBookingPrice: "",
                flexibleBookingPrice: "",
            },
        });
    };

    handleEditPriceBoard = (price) => {
        this.setState({
            showModal: true,
            editMode: true,
            newPriceBoard: { ...price },
            priceListId: price.priceListId,
        });
    };

    handleDeletePriceBoard = (priceListId) => {
        showConfirmAlert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa bảng giá này không ?", "Xóa", "center").then((result) => {
            axiosInstance
                .delete(`/price-list/${priceListId}`)
                .then((response) => {
                    if (response.status === 200) {
                        this.fetchPrice();
                        this.setState((prevState) => ({
                            priceBoard: prevState.priceBoard.filter((board) => board.priceListId !== priceListId),
                        }));
                        showAlert("success", "Thành công", "Xóa bảng giá thành công", "top-end");
                    }
                })
                .catch((error) => {
                    if (error.response && error.response.status === 401 && error.response.data.message === "Token không hợp lệ hoặc đã hết hạn.") {
                        handleTokenError();
                    }
                    this.handleRequestError(error);
                });
        });
    };

    handlePageChange = (pageNumber) => {
        this.setState({ currentPage: pageNumber });
    };

    handleModalInputChange = (e) => {
        const { name, value } = e.target;
        this.setState((prevState) => ({
            newPriceBoard: {
                ...prevState.newPriceBoard,
                [name]: value,
            },
        }));
    };

    handleSavePriceBoard = () => {
        const { newPriceBoard, priceBoard, editMode } = this.state;
        if (editMode) {
            axiosInstance
                .put("/price-list/", newPriceBoard)
                .then((response) => {
                    this.fetchPrice();
                    if (response.status === 200) {
                        this.setState({
                            newPriceBoard: {
                                priceListId: "",
                                singleBookingPrice: "",
                                fixedBookingPrice: "",
                                flexibleBookingPrice: "",
                            },
                            showModal: false,
                        });
                        showAlert("success", "Thành công", "Cập nhật bảng giá thành công", "top-end");
                    }
                })
                .catch((error) => {
                    if (error.response && error.response.status === 401 && error.response.data.message === "Token không hợp lệ hoặc đã hết hạn.") {
                        handleTokenError();
                    }
                    this.handleRequestError(error);
                });
        } else {
            axiosInstance
                .post("/price-list/", newPriceBoard)
                .then((response) => {
                    if (response.status === 200) {
                        this.setState({
                            priceBoard: [...priceBoard, response.data],
                            showModal: false,
                        });
                        showAlert("success", "Thành công", "Thêm bảng giá thành công", "top-end");
                    }
                })
                .catch((error) => {
                    if (error.response && error.response.status === 401 && error.response.data.message === "Token không hợp lệ hoặc đã hết hạn.") {
                        handleTokenError();
                    }
                    this.handleRequestError(error);
                });
        }
    };

    renderPriceBoard = () => {
        const { priceBoard, currentPage, boardsPerPage } = this.state;
        const indexOfLastBoard = currentPage * boardsPerPage;
        const indexOfFirstBoard = indexOfLastBoard - boardsPerPage;
        const currentBoards = priceBoard.slice(indexOfFirstBoard, indexOfLastBoard);

        return currentBoards.map((price) => (
            <div className="overflow-x-auto">
                <table className="table table-striped table-hover" key={price.priceListId}>
                    <thead>
                        <tr>
                            <th colSpan={5}>
                                <div className="">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="">Bảng giá số {price.priceListId}</div>
                                        <div>
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                data-bs-toggle="modal"
                                                data-bs-target="#showCourt"
                                                onClick={() => this.setState({ priceListId: price.priceListId })}
                                            >
                                                <i className="fa-solid fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </th>
                        </tr>
                        <tr>
                            <th>Loại lịch</th>
                            <th>Lịch đơn</th>
                            <th>Lịch cố định</th>
                            <th>Lịch linh hoạt</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="text-center">Giá/Slot</td>
                            <td className="text-center">{price.singleBookingPrice.toLocaleString("vi-VN")} VND</td>
                            <td className="text-center">{price.fixedBookingPrice.toLocaleString("vi-VN")} VND</td>
                            <td className="text-center">{price.flexibleBookingPrice.toLocaleString("vi-VN")} VND</td>
                            <td className="d-flex justify-content-between">
                                <button className="btn btn-warning" onClick={() => this.handleEditPriceBoard(price)}>
                                    <i className="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button className="btn btn-danger" onClick={() => this.handleDeletePriceBoard(price.priceListId)}>
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        ));
    };

    handleAddCourtToListPrice = (courtId) => {
        const { priceListId } = this.state;
        if (!priceListId) {
            showAlert("error", "Lỗi", "Không tìm thấy priceListId", "top-end");
            return;
        }

        axiosInstance
            .post(`/price-list/${priceListId}/court/${courtId}`)
            .then((response) => {
                if (response.status === 200) {
                    showAlert("success", "Thành công", "Đã thêm sân vào bảng giá", "top-end");
                } else {
                    showAlert("error", "Lỗi", "Không thể thêm sân vào bảng giá", "top-end");
                    console.error("Response không thành công:", response.status);
                }
            })
            .catch((error) => {
                if (error.response && error.response.status === 401 && error.response.data.message === "Token không hợp lệ hoặc đã hết hạn.") {
                    handleTokenError();
                }
                this.handleRequestError(error);
            });
    };

    renderPagination = () => {
        const { priceBoard, currentPage, boardsPerPage } = this.state;
        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(priceBoard.length / boardsPerPage); i++) {
            pageNumbers.push(i);
        }

        return (
            <nav>
                <ul className="pagination">
                    {pageNumbers.map((number) => (
                        <li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}>
                            <a onClick={() => this.handlePageChange(number)} className="page-link">
                                {number}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        );
    };

    render() {
        const { showModal, newPriceBoard, editMode } = this.state;

        return (
            <div className="py-4 priceBoard">
                <button className="btn btn-success p-2 w-25 my-2" data-toggle="modal" data-target="#modalPrice" onClick={this.handleAddPriceBoard}>
                    Thêm bảng slot mới
                </button>
                <div>
                    <div className="row">{this.renderPriceBoard()}</div>
                    {this.renderPagination()}
                </div>
                {/* Modal */}
                {showModal && (
                    <div className="modal fade show" tabIndex={-1} role="dialog" style={{ display: "block" }}>
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{editMode ? "Chỉnh sửa bảng giá" : "Thêm bảng giá mới"}</h5>
                                    <button
                                        type="button"
                                        className="close"
                                        data-dismiss="modal"
                                        aria-label="Close"
                                        onClick={() => this.setState({ showModal: false })}
                                    >
                                        <span aria-hidden="true">×</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <form>
                                        <div className="form-group">
                                            <label>Giá lịch đơn</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="singleBookingPrice"
                                                value={newPriceBoard.singleBookingPrice}
                                                onChange={this.handleModalInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Giá lịch cố định</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="fixedBookingPrice"
                                                value={newPriceBoard.fixedBookingPrice}
                                                onChange={this.handleModalInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Giá lịch linh hoạt</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="flexibleBookingPrice"
                                                value={newPriceBoard.flexibleBookingPrice}
                                                onChange={this.handleModalInputChange}
                                            />
                                        </div>
                                    </form>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-primary" onClick={this.handleSavePriceBoard}>
                                        Lưu thay đổi
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        data-dismiss="modal"
                                        onClick={() => this.setState({ showModal: false })}
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div>
                    {/* Modal show court */}
                    <div className="modal fade" id="showCourt" tabIndex="-1" aria-labelledby="addSlotLabel" aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalLongTitle">
                                        Danh sách các sân
                                    </h5>
                                    <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">×</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {this.state.courts.map((c) => (
                                        <div key={c.courtId} className="d-flex aliign-items-center justify-between mt-2">
                                            <div className="p-0 m-0">{c.courtName}</div>
                                            <button
                                                className="btn btn-success "
                                                style={{ width: 30, height: 30 }}
                                                onClick={() => this.handleAddCourtToListPrice(c.courtId)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
