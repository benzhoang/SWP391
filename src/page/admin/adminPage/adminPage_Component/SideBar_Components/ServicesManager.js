import React, { Component } from "react";
import "./style.css";
import { showAlert, showConfirmAlert } from "../../../../../utils/alertUtils";
import axiosInstance from "../../../../../config/axiosConfig";
import { handleTokenError } from "../../../../../utils/tokenErrorHandle";

// Ensure Bootstrap CSS and JS are imported
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

export default class ServicesManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            services: [],
            modalMode: "",
            currentService: { facilityIcon: "", facilityName: "", facilityId: "" },
        };
    }

    componentDidMount() {
        this.fetchAllServices();
    }

    fetchAllServices = () => {
        axiosInstance
            .get("/facility/all")
            .then((res) => {
                if (res.status === 200) {
                    this.setState({ services: res.data });
                } else {
                    this.setState({ services: [] });
                    showAlert("error", "Lỗi!", "Không lấy được dữ liệu", "top-end");
                    console.error("Response không thành công:", res.status);
                }
            })
            .catch((error) => {
                console.error("Lỗi khi gọi API:", error);
                if (error.response) {
                    console.error("Phản hồi từ server:", error.response.data);
                }
                if (error.response && error.response.status === 401 && error.response.data.message === "Token không hợp lệ hoặc đã hết hạn.") {
                    handleTokenError();
                } else {
                    this.handleRequestError(error);
                }
            });
    };

    handleRequestError = (error) => {
        console.error("Đã xảy ra lỗi:", error);
        showAlert("error", "Lỗi!", "Đã xảy ra lỗi khi lấy dữ liệu", "top-end");
    };

    openModal = (mode, service = { facilityIcon: "", facilityName: "", facilityId: "" }) => {
        this.setState({ modalMode: mode, currentService: service }, () => {
            const modal = new window.bootstrap.Modal(document.getElementById("modalAdd"));
            modal.show();
        });
    };

    renderServices = () => {
        return this.state.services.map((ser) => (
            <div className="d-flex" style={{ alignContent: "center", justifyContent: "space-between", padding: "10px 5px" }} key={ser.facilityId}>
                <div
                    className="d-flex align-items-center w-75 "
                    style={{ alignContent: "center", justifyContent: "flex-start", padding: "10px 5px" }}
                >
                    <i className={ser.facilityIcon}></i>
                    <p className="ms-3 serName">{ser.facilityName}</p>
                </div>
                <div className="w-50 d-flex justify-end">
                    <button className="btn btn-warning p-2 w-25" onClick={() => this.openModal("edit", ser)}>
                        <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button className="btn btn-danger p-2 w-25" onClick={() => this.handleDeleteService(ser.facilityId)}>
                        <i className="fa-solid fa-square-minus"></i>
                    </button>
                </div>
            </div>
        ));
    };

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({ currentService: { ...this.state.currentService, [name]: value } });
    };

    handleSave = () => {
        const { modalMode, currentService } = this.state;
        if (modalMode === "add") {
            this.handleAddServices(currentService);
        } else if (modalMode === "edit") {
            this.handleUpdateServices(currentService);
        }
    };

    handleAddServices = (service) => {
        axiosInstance
            .post("/facility/add", service)
            .then((res) => {
                if (res.status === 200) {
                    showAlert("success", "Thành công!", "Dịch vụ đã được thêm thành công", "top-end");
                    this.fetchAllServices();
                } else {
                    showAlert("error", "Lỗi!", "Không thể thêm dịch vụ", "top-end");
                }
            })
            .catch((error) => {
                this.handleRequestError(error);
            });
    };

    handleUpdateServices = () => {
        const { currentService } = this.state;

        axiosInstance
            .put("/facility/update", currentService, {
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then((res) => {
                if (res.status === 200) {
                    this.fetchAllServices();
                    this.setState({
                        currentService: {
                            facilityId: "",
                            facilityIcon: "",
                            facilityName: "",
                        },
                    });
                    showAlert("success", "", "Chỉnh sửa dịch vụ thành công", "top-end"); // Updated success message
                } else {
                    showAlert("error", "Lỗi !", "Chỉnh sửa dịch vụ không thành công", "top-end"); // Updated error message
                    console.error("Response không thành công:", res.status);
                }
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    if (error.response.data.message === "Token không hợp lệ hoặc đã hết hạn.") {
                        handleTokenError();
                    } else if (error.response.data.message === "Slot với tên này đã có trong danh sách.") {
                        showAlert("error", "Lỗi!", "Slot với tên này đã có trong danh sách.", "top-end");
                    }
                }
                this.handleRequestError(error);
            });
    };

    handleDeleteService = (facilityId) => {
        axiosInstance
            .delete(`/facility/delete/${facilityId}`)
            .then((res) => {
                if (res.status === 200) {
                    showAlert("success", "Thành công!", "Dịch vụ đã được xóa thành công", "top-end");
                    this.fetchAllServices();
                } else {
                    showAlert("error", "Lỗi!", "Không thể xóa dịch vụ", "top-end");
                }
            })
            .catch((error) => {
                this.handleRequestError(error);
            });
    };

    render() {
        const { modalMode, currentService } = this.state;

        return (
            <div>
                <div className="services-form mt-5">
                    <div className="d-flex">
                        <button className="btn btn-primary p-1 w-25" onClick={() => this.openModal("add")}>
                            Thêm
                        </button>
                    </div>
                    <div className="list-services">
                        <div className="">{this.renderServices()}</div>
                    </div>
                </div>
                {/* Modal */}
                <div className="modal fade" id="modalAdd" tabIndex={-1} aria-labelledby="modalAddLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="modalAddLabel">
                                    {modalMode === "add" ? "Thêm mới dịch vụ" : "Cập nhật dịch vụ"}
                                </h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="facilityIcon" className="form-label">
                                        Icon
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="facilityIcon"
                                        name="facilityIcon"
                                        value={currentService.facilityIcon}
                                        onChange={this.handleInputChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="facilityName" className="form-label">
                                        Tên dịch vụ
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="facilityName"
                                        name="facilityName"
                                        value={currentService.facilityName}
                                        onChange={this.handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary p-2" data-bs-dismiss="modal">
                                    Đóng
                                </button>
                                <button type="button" className="btn btn-primary p-2" onClick={this.handleSave}>
                                    {modalMode === "add" ? "Thêm" : "Lưu thay đổi"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
