import React, { Component } from "react";
import { showAlert, showConfirmAlert } from "../../utils/alertUtils";
import axiosInstance from "../../config/axiosConfig";
import { handleTokenError } from "../../utils/tokenErrorHandle";

export default class extends Component {
    state = {
        courts: [],
        newCourt: {
            courtId: "",
            courtName: "",
            courtId: "",
            courtName: "",
            address: "",
            openTime: "",
            closeTime: "",
            rate: "",
            imageUrl: "",
            beginDate: "",
        },
        isDetailView: false,
    };

    componentDidMount() {
        this.fetchCourts();
    }

    fetchCourts = () => {
        axiosInstance
            .get("/court/courts-of-owner")
            .then((res) => {
                if (res.status === 200) {
                    this.setState({ courts: res.data });
                } else {
                    this.setState({ courts: [] });
                    showAlert("error", "Lỗi !", "Không lấy được dữ liệu", "top-end");
                    console.error("Response không thành công:", res.status);
                }
            })
            .catch((error) => {
                if (error.response && error.response.status === 401 && error.response.data.message === "Token không hợp lệ hoặc đã hết hạn.") {
                    handleTokenError();
                }
                this.handleRequestError(error);
            });
    };

    handleRequestError = (error) => {
        console.error("Lỗi từ server:", error.response.data);
    };

    handleInputChange = (event) => {
        const { name, value } = event.target;
        this.setState((prevState) => ({
            newCourt: {
                ...prevState.newCourt,
                [name]: value,
            },
        }));
    };

    handleFileChange = (event) => {
        const file = event.target.files[0];
        this.setState((prevState) => ({
            newCourt: {
                ...prevState.newCourt,
                imageUrl: file,
            },
        }));
    };

    handleAddCourt = () => {
        const { newCourt } = this.state;

        let formData = new FormData();
        formData.append("courtName", newCourt.courtName);
        formData.append("address", newCourt.address);
        formData.append("openTime", newCourt.openTime);
        formData.append("closeTime", newCourt.closeTime);
        if (newCourt.imageUrl) {
            formData.append("imageUrl", newCourt.imageUrl);
        }

        axiosInstance
            .post("/court/add", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((res) => {
                if (res.status === 200) {
                    this.fetchCourts();
                    this.setState({
                        newCourt: {
                            courtId: "",
                            courtName: "",
                            address: "",
                            openTime: "",
                            closeTime: "",
                            rate: "",
                            imageUrl: "",
                        },
                    });
                    showAlert("success", "", "Thêm cơ sở thành công", "top-end");
                } else {
                    showAlert("error", "Lỗi !", "Thêm cơ sở không thành công", "top-end");
                    console.error("Response không thành công:", res.status);
                }
            })
            .catch((error) => {
                if (error.response && error.response.status === 401 && error.response.data.message === "Token không hợp lệ hoặc đã hết hạn.") {
                    handleTokenError();
                } else {
                    showAlert("error", "Lỗi !", "Thêm cơ sở không thành công", "top-end");
                }
                this.handleRequestError(error);
            });
    };

    handleDeleteCourt = (courtId) => {
        showConfirmAlert(
            "Xác nhận xóa",
            "Bạn có chắc chắn muốn xóa toàn bộ dữ liệu của cơ sở này bao gồm cả nhân viên, đơn hàng,...",
            "Xóa",
            "center"
        ).then((result) => {
            if (result.isConfirmed) {
                axiosInstance
                    .delete(`/court/delete?courtId=${courtId}`)
                    .then((res) => {
                        if (res.status === 200) {
                            this.fetchCourts();
                            showAlert("success", "", "Đã xóa cơ sở thành công", "top-end");
                        } else {
                            showAlert("error", "", "Xóa cơ sở không thành công", "top-end");
                        }
                    })
                    .catch((error) => {
                        if (
                            error.response &&
                            error.response.status === 401 &&
                            error.response.data.message === "Token không hợp lệ hoặc đã hết hạn."
                        ) {
                            handleTokenError();
                        } else {
                            showAlert("error", "", "Xóa cơ sở không thành công", "top-end");
                        }
                        console.error("Response không thành công:", error);
                    });
            }
        });
    };

    handleUpdateCourt = () => {
        const { newCourt } = this.state;

        let formData = new FormData();
        formData.append("courtId", newCourt.courtId); // Thêm courtId vào formData
        formData.append("courtName", newCourt.courtName);
        formData.append("address", newCourt.address);
        formData.append("openTime", newCourt.openTime);
        formData.append("closeTime", newCourt.closeTime);
        if (newCourt.imageUrl && newCourt.imageUrl instanceof File) {
            formData.append("imageUrl", newCourt.imageUrl);
        }

        axiosInstance
            .put(`/court/update`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((res) => {
                if (res.status === 200) {
                    this.fetchCourts();
                    this.setState({
                        newCourt: {
                            courtId: "",
                            courtName: "",
                            address: "",
                            openTime: "",
                            closeTime: "",
                            rate: "",
                            imageUrl: "",
                        },
                    });
                    showAlert("success", "", "Cập nhật cơ sở thành công", "top-end");
                } else {
                    showAlert("error", "Lỗi !", "Cập nhật cơ sở không thành công", "top-end");
                    console.error("Response không thành công:", res.status);
                }
            })
            .catch((error) => {
                if (error.response && error.response.status === 401 && error.response.data.message === "Token không hợp lệ hoặc đã hết hạn.") {
                    handleTokenError();
                } else {
                    showAlert("error", "Lỗi !", "Cập nhật cơ sở không thành công", "top-end");
                }
                this.handleRequestError(error);
            });
    };

    renderStars(rate) {
        const totalStars = 5; // Tổng số ngôi sao
        const stars = [];
        for (let i = 1; i <= totalStars; i++) {
            if (i <= rate) {
                stars.push(<span key={i} className="fa fa-star checked" style={{ color: "#ffc107" }}></span>);
            } else {
                stars.push(<span key={i} className="fa fa-star" style={{ color: "#000000" }}></span>);
            }
        }
        return stars;
    }

    render() {
        return (
            <div>
                {/* Modal Chi Tiết */}
                <div className="modal fade my-5" id="detailModal" tabIndex="-1" aria-labelledby="detailModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="detailModalLabel">
                                    Chi tiết sân
                                </h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <img src={this.state.newCourt.imageUrl} alt="Hình ảnh cơ sở" className="img-fluid" />
                                    </div>
                                    <div className="col-md-6">
                                        <h4>{this.state.newCourt.courtName}</h4>
                                        <p>
                                            <strong>Mã cơ sở:</strong> {this.state.newCourt.courtId}
                                        </p>

                                        <p>
                                            <strong>Địa chỉ:</strong> {this.state.newCourt.address}
                                        </p>
                                        <p>
                                            <strong>Khung giờ hoạt động:</strong> {this.state.newCourt.openTime} - {this.state.newCourt.closeTime}
                                        </p>
                                        <p>
                                            <strong>Ngày bắt đầu hoạt động:</strong> {this.state.newCourt.beginDate}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Kết thúc Modal Chi Tiết */}

                <div className="row my-3">
                    <div className="col-md-8">
                        <button
                            id="btnThemCoSo"
                            className="btn btn-primary w-25"
                            data-bs-toggle="modal"
                            data-bs-target="#addNewCourt"
                            onClick={() =>
                                this.setState({
                                    newCourt: {
                                        courtName: "",
                                        courtName: "",
                                        address: "",
                                        openTime: "",
                                        closeTime: "",
                                        imageUrl: "",
                                    },
                                    isDetailView: false,
                                })
                            }
                        >
                            <i className="fa fa-plus mr-1" />
                            Thêm Mới
                        </button>
                    </div>
                    {/* <div className="col-md-4">
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Nhập từ khóa"
                                aria-label="Recipient's username"
                                aria-describedby="basic-addon2"
                            />
                            <div className="input-group-append">
                                <span className="input-group-text" id="basic-addon2">
                                    <i className="fa fa-search" />
                                </span>
                            </div>
                        </div>
                    </div> */}
                </div>

                <div className="clear-fix" />
                <div className="tblCoSo" id="tblCoSo">
                    <div className="overflow-x-auto">
                        <table className="table table-hover" style={{ minWidth: "1000px" }}>
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Mã cơ sở</th>
                                    <th className="text-start">Tên Cơ Sở</th>
                                    <th className="text-start ">Địa chỉ</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.courts.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center">
                                            Danh sách cơ sở trống
                                        </td>
                                    </tr>
                                ) : (
                                    this.state.courts.map((court, index) => (
                                        <tr className="" key={court.courtId}>
                                            <td className="text-center">{index + 1}</td>
                                            <td className="text-center">{court.courtId}</td>
                                            <td className="text-start">{court.courtName}</td>
                                            <td>{court.address}</td>
                                            <td className="d-flex btn-action">
                                                <button
                                                    className="btn btn-info mr-2 p-2"
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#detailModal"
                                                    onClick={() => this.setState({ newCourt: court, isDetailView: true })}
                                                >
                                                    <i className="fa fa-info-circle"></i>
                                                </button>
                                                <button
                                                    className="btn btn-warning mr-2 p-2"
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#updateCourt"
                                                    onClick={() => this.setState({ newCourt: court, isDetailView: false })}
                                                >
                                                    <i className="fa fa-pen-to-square "></i>
                                                </button>
                                                <button className="btn btn-danger p-2" onClick={() => this.handleDeleteCourt(court.courtId)}>
                                                    <i className="fa fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <br />

                {/* Modal Thêm Mới/Cập Nhật */}
                <div className="modal fade" id="addNewCourt" tabIndex="-1" aria-labelledby="addStaffLabel" aria-hidden="true">
                    <div className="modal-dialog" style={{ marginTop: 65 }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="text-center">Điền thông tin cơ sở</h4>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="courtName">Tên cơ sở</label>
                                    <input
                                        id="courtName"
                                        name="courtName"
                                        className="form-control"
                                        placeholder="Nhập tên cơ sở"
                                        value={this.state.newCourt.courtName}
                                        onChange={this.handleInputChange}
                                        readOnly={this.state.isDetailView}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="address">Địa chỉ</label>
                                    <input
                                        id="address"
                                        name="address"
                                        className="form-control"
                                        placeholder="Nhập địa chỉ"
                                        value={this.state.newCourt.address}
                                        onChange={this.handleInputChange}
                                        readOnly={this.state.isDetailView}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="openTime">Giờ mở cửa</label>
                                    <input
                                        type="time"
                                        id="openTime"
                                        name="openTime"
                                        className="form-control"
                                        placeholder="Nhập giờ mở cửa (ví dụ: 07:00)"
                                        value={this.state.newCourt.openTime}
                                        onChange={this.handleInputChange}
                                        readOnly={this.state.isDetailView}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="closeTime">Giờ đóng cửa</label>
                                    <input
                                        type="time"
                                        id="closeTime"
                                        name="closeTime"
                                        className="form-control"
                                        placeholder="Nhập giờ đóng cửa (ví dụ: 21:00)"
                                        value={this.state.newCourt.closeTime}
                                        onChange={this.handleInputChange}
                                        readOnly={this.state.isDetailView}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="imageUrl">Hình ảnh</label>
                                    <input
                                        id="imageUrl"
                                        name="imageUrl"
                                        type="file"
                                        className="form-control"
                                        // value={this.state.newCourt.imgURL}
                                        onChange={this.handleFileChange}
                                        readOnly={this.state.isDetailView}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                {!this.state.isDetailView && (
                                    <div className="d-flex w-100">
                                        <button type="button" className="btn btn-primary " onClick={this.handleAddCourt}>
                                            Thêm sân
                                        </button>
                                    </div>
                                )}

                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="updateCourt" tabIndex="-1" aria-labelledby="addStaffLabel" aria-hidden="true">
                    <div className="modal-dialog" style={{ marginTop: 65 }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4>Cập nhật thông tin</h4>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="courtName">Tên cơ sở</label>
                                    <input
                                        id="courtName"
                                        name="courtName"
                                        type="text"
                                        readOnly={false}
                                        className="form-control"
                                        placeholder="Nhập tên cơ sở"
                                        value={this.state.newCourt.courtName}
                                        onChange={this.handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="address">Địa chỉ</label>
                                    <input
                                        id="address"
                                        name="address"
                                        className="form-control"
                                        placeholder="Nhập địa chỉ"
                                        value={this.state.newCourt.address}
                                        onChange={this.handleInputChange}
                                        readOnly={this.state.isDetailView}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="openTime">Khung giờ hoạt động</label>
                                    <input
                                        id="openTime"
                                        name="openTime"
                                        className="form-control"
                                        placeholder="Nhập giờ mở cửa (7:00)"
                                        value={this.state.newCourt.openTime}
                                        onChange={this.handleInputChange}
                                        readOnly={this.state.isDetailView}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="closeTime">Khung giờ đóng cửa</label>
                                    <input
                                        id="closeTime"
                                        name="closeTime"
                                        className="form-control"
                                        placeholder="Nhập giờ đóng cửa"
                                        value={this.state.newCourt.closeTime}
                                        onChange={this.handleInputChange}
                                        readOnly={this.state.isDetailView}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="imageUrl">Hình ảnh</label>
                                    <input
                                        id="imageUrl"
                                        name="imageUrl"
                                        type="file"
                                        className="form-control"
                                        // value={this.state.newCourt.imgURL}
                                        onChange={this.handleFileChange}
                                        readOnly={this.state.isDetailView}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                {!this.state.isDetailView && (
                                    <div className="d-flex w-100">
                                        <button type="button" className="btn btn-success " onClick={this.handleUpdateCourt}>
                                            Lưu
                                        </button>
                                    </div>
                                )}

                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Kết thúc Modal Thêm Mới/Cập Nhật */}
            </div>
        );
    }
}
