import React, { Component } from "react";
import { showAlert, showConfirmAlert } from "../../utils/alertUtils";
import axiosInstance from "../../config/axiosConfig";
import { Modal, Button, Form } from "bootstrap/dist/js/bootstrap.bundle.min";
import { handleTokenError } from "../../utils/tokenErrorHandle";
import "./manager.css";
import { event } from "jquery";

export default class Yard extends Component {
    state = {
        courts: [],
        yards: [],
        slots: [],
        newYard: {
            yardId: "",
            yardName: "",
        },
        selectedCourt: "",
        selectedCourtName: "",
        selectedYard: "",
        slotInYard: [],
        showModal: false,
        isEditing: false,
        currentPage: 1,
        itemsPerPage: 5,
        searchSlot: "",
        showAddModal: false,
        showEditModal: false,
    };
    componentDidMount() {
        this.fetchCourts();
        this.fetchSlotOfCourt();
    }

    fetchCourts = () => {
        axiosInstance
            .get("/court/courts-of-owner")
            .then((res) => {
                if (res.status === 200) {
                    const firstCourt = res.data[0];
                    this.setState({ courts: res.data, selectedCourt: firstCourt.courtId, selectedCourtName: firstCourt.courtName }, () => {
                        this.fetchYardWithCourtID(firstCourt.courtId);
                    });
                } else {
                    this.handleRequestError(res);
                }
            })
            .catch((error) => {
                this.handleRequestError(error);
            });
    };

    fetchSlotOfCourt = () => {
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
                if (error.response && error.response.status === 401 && error.response.data.message === "Token không hợp lệ hoặc đã hết hạn.") {
                    handleTokenError();
                }
                this.handleRequestError(error);
            });
    };

    fetchYardWithCourtID = (selectedCourt) => {
        axiosInstance
            .get(`/yard/findAllYard?courtId=${selectedCourt}`)
            .then((res) => {
                if (res.status === 200) {
                    const firstYard = res.data[0];
                    this.setState({ yards: res.data, selectedYard: firstYard ? firstYard.yardId : "" }, () => {
                        if (firstYard) {
                            this.fetchSlotWithYard(firstYard.yardId);
                        }
                    });
                } else {
                    this.handleRequestError(res);
                }
            })
            .catch((error) => {
                this.handleRequestError(error);
            });
    };

    fetchSlotWithYard = (yardId) => {
        axiosInstance
            .get(`/yard-schedule/getAllByYardId/${yardId}`)
            .then((res) => {
                if (res.status === 200) {
                    const filteredSlots = res.data.filter((slot) => {
                        const keyword = this.state.searchSlot.toLowerCase();
                        return (
                            slot.slotName.toLowerCase().includes(keyword) ||
                            slot.startTime.toLowerCase().includes(keyword) ||
                            slot.endTime.toLowerCase().includes(keyword)
                        );
                    });
                    this.setState({ slotInYard: filteredSlots });
                } else {
                    this.handleRequestError(res);
                }
            })
            .catch((error) => {
                this.handleRequestError(error);
            });
    };

    handleCourtChange = (event) => {
        const courtId = event.target.value;
        const courtName = event.target.options[event.target.selectedIndex].text;
        this.setState({
            selectedCourt: courtId,
            selectedCourtName: courtName,
        });

        this.fetchYardWithCourtID(courtId);
    };

    handleYardClick = (yardId) => {
        this.setState({ selectedYard: yardId }, () => {
            this.fetchSlotWithYard(yardId);
        });
    };

    handleAddSlot = (slotId) => {
        const { selectedYard } = this.state;

        if (!selectedYard) {
            showAlert("error", "Lỗi!", "Vui lòng chọn một sân trước khi thêm slot.", "top-end");
            return;
        }

        axiosInstance
            .post(`/yard-schedule/${selectedYard}/timeSlot/${slotId}`)
            .then((res) => {
                if (res.status === 200) {
                    showAlert("success", "Thành công!", "Đã thêm slot vào sân.", "top-end");
                    this.fetchSlotWithYard(selectedYard);
                } else {
                    this.handleRequestError(res);
                }
            })
            .catch((error) => {
                this.handleRequestError(error);
            });
    };
    handleAddYard = () => {
        const newYardName = this.state.newYard.yardName.trim();

        if (!newYardName) {
            showAlert("error", "Lỗi!", "Vui lòng nhập tên sân cần thêm.", "top-end");
            return;
        }

        const { selectedCourt } = this.state;

        axiosInstance
            .post("/yard/createyard", { courtId: selectedCourt, yardName: newYardName })
            .then((res) => {
                if (res.status === 200) {
                    showAlert("success", "Thành công!", "Đã thêm sân mới.", "top-end");
                    this.fetchYardWithCourtID(selectedCourt); // Refresh yards after addition
                    this.setState({ newYard: { yardId: "", yardName: "" } }); // Clear input after addition
                } else {
                    this.handleRequestError(res);
                }
            })
            .catch((error) => {
                this.handleRequestError(error);
            });
    };

    handleEditYard = () => {
        const { newYard } = this.state;
        if (!newYard.yardId || !newYard.yardName.trim()) {
            showAlert("error", "Lỗi!", "Vui lòng chọn sân và nhập tên sân mới.", "top-end");
            return;
        }

        axiosInstance
            .put(`/yard/updateyard`, { yardId: newYard.yardId, yardName: newYard.yardName })
            .then((res) => {
                if (res.status === 200) {
                    showAlert("success", "Thành công!", "Đã cập nhật sân.", "top-end");
                    this.fetchYardWithCourtID(this.state.selectedCourt); // Refresh yards after update
                    this.setState({ newYard: { yardId: "", yardName: "" }, isEditing: false }); // Clear input after update
                } else {
                    this.handleRequestError(res);
                }
            })
            .catch((error) => {
                this.handleRequestError(error);
            });
    };
    handleEditYard = () => {
        const { newYard } = this.state;
        if (!newYard.yardId || !newYard.yardName.trim()) {
            showAlert("error", "Lỗi!", "Vui lòng chọn sân và nhập tên sân mới.", "top-end");
            return;
        }

        axiosInstance
            .put(`/yard/updateyard`, { yardId: newYard.yardId, yardName: newYard.yardName })
            .then((res) => {
                if (res.status === 200) {
                    showAlert("success", "Thành công!", "Đã cập nhật sân.", "top-end");
                    this.fetchYardWithCourtID(this.state.selectedCourt); // Refresh yards after update
                    this.setState({ newYard: { yardId: "", yardName: "" }, isEditing: false }); // Clear input after update
                } else {
                    this.handleRequestError(res);
                }
            })
            .catch((error) => {
                this.handleRequestError(error);
            });
    };
    handleSearchSlotWithNameOrTime = (e) => {
        const searchSlot = e.target.value;
        this.setState({ searchSlot }, () => {
            this.fetchSlotWithYard(this.state.selectedYard);
        });
    };
    deleteSlotForYard = (slotId) => {
        const { selectedYard } = this.state;

        if (!selectedYard) {
            showAlert("error", "Lỗi!", "Vui lòng chọn một sân trước khi xóa slot.", "top-end");
            return;
        }

        axiosInstance
            .delete(`/yard-schedule/${selectedYard}/deleteSlotFromYard/${slotId}`)
            .then((res) => {
                if (res.status === 200) {
                    showAlert("success", "Thành công!", "Đã xóa slot khỏi sân.", "top-end");
                    this.fetchSlotWithYard(selectedYard);
                } else {
                    this.handleRequestError(res);
                }
            })
            .catch((error) => {
                this.handleRequestError(error);
            });
    };
    handleAddYard = () => {
        const newYardName = this.state.newYard.yardName.trim();

        if (!newYardName) {
            showAlert("error", "Lỗi!", "Vui lòng nhập tên sân cần thêm.", "top-end");
            return;
        }

        const { selectedCourt } = this.state;

        axiosInstance
            .post("/yard/createyard", { courtId: selectedCourt, yardName: newYardName })
            .then((res) => {
                if (res.status === 200) {
                    showAlert("success", "Thành công!", "Đã thêm sân mới.", "top-end");

                    this.fetchYardWithCourtID(selectedCourt);
                } else {
                    this.handleRequestError(res);
                }
            })
            .catch((error) => {
                this.handleRequestError(error);
            });
    };

    toggleModal = () => {
        this.setState((prevState) => ({
            showModal: !prevState.showModal,
        }));
    };

    handleRequestError = (error) => {
        let errorMessage = "Có lỗi xảy ra khi lấy dữ liệu";
        if (error.response) {
            if (error.response.status === 401 && error.response.data.message === "Token không hợp lệ hoặc đã hết hạn.") {
                handleTokenError();
                errorMessage = "Token không hợp lệ hoặc đã hết hạn.";
            } else {
                errorMessage = error.response.data.message || errorMessage;
            }
        }
        showAlert("error", "Lỗi !", errorMessage, "top-end");
        console.error("Request error:", error);
    };

    renderCourtOption = () => {
        return this.state.courts.map((court) => (
            <option key={court.courtId} value={court.courtId}>
                {court.courtName}
            </option>
        ));
    };

    renderYardWithCourt = () => {
        return this.state.yards.map((yard) => (
            <div key={yard.yardId} className="d-flex align-items-center justify-center">
                <button
                    className={`yardBtn btn m-2 p-2 ${this.state.selectedYard === yard.yardId ? "active" : ""}`}
                    onClick={() => this.handleYardClick(yard.yardId)}
                >
                    {yard.yardName}
                </button>
                <div className="d-flex"></div>
            </div>
        ));
    };

    handlePageChange = (pageNumber) => {
        this.setState({ currentPage: pageNumber });
    };

    renderSlotInYard = () => {
        const { slotInYard, currentPage, itemsPerPage } = this.state;
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentSlots = slotInYard.slice(indexOfFirstItem, indexOfLastItem);

        return currentSlots.map((slot, index) => (
            <tr key={slot.slotId}>
                <td className="text-center">{indexOfFirstItem + index + 1}</td>
                <td className="text-center">{slot.slotName}</td>
                <td className="text-center">
                    {slot.startTime} - {slot.endTime}
                </td>
                <td className="text-center">
                    <button className="btn btn-danger w-100 m-auto" onClick={() => this.deleteSlotForYard(slot.slotId)}>
                        Xóa
                    </button>
                </td>
            </tr>
        ));
    };

    renderPagination = () => {
        const { slotInYard, currentPage, itemsPerPage } = this.state;
        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(slotInYard.length / itemsPerPage); i++) {
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

    renderSlotYardHaveNot = () => {
        const { slots, slotInYard } = this.state;
        const slotInYardIds = slotInYard.map((slot) => slot.slotId);

        return slots
            .filter((slot) => !slotInYardIds.includes(slot.slotId))
            .map((slot) => (
                <div key={slot.slotId} className="d-flex align-items-center justify-content-between p-2">
                    <div>
                        {slot.slotName}: {slot.startTime} - {slot.endTime}
                    </div>
                    <button className="btn btn-primary w-25" onClick={() => this.handleAddSlot(slot.slotId)}>
                        <i className="fa fa-plus"></i>
                    </button>
                </div>
            ));
    };

    handleEditYard = () => {
        const { selectedYard, newYard } = this.state;
        if (!selectedYard || !newYard.yardName.trim()) {
            showAlert("error", "Lỗi!", "Vui lòng chọn sân và nhập tên sân mới.", "top-end");
            return;
        }

        axiosInstance
            .put(`/yard/updateyard`, { yardId: selectedYard, yardName: newYard.yardName })
            .then((res) => {
                if (res.status === 200) {
                    showAlert("success", "Thành công!", "Đã cập nhật sân.", "top-end");
                    this.fetchYardWithCourtID(this.state.selectedCourt);
                    this.toggleModal();
                } else {
                    this.handleRequestError(res);
                }
            })
            .catch((error) => {
                this.handleRequestError(error);
            });
    };

    handleDeleteYard = (yardId) => {
        showConfirmAlert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa sân này không?", "Xóa", "center").then((result) => {
            if (result.isConfirmed) {
                const deleteYard = () => {
                    axiosInstance
                        .delete(`/yard/delete/${yardId}`)
                        .then((res) => {
                            if (res.status === 200) {
                                this.fetchYardWithCourtID(this.state.selectedCourt);
                                showAlert("success", "", "Đã xóa sân thành công", "top-end");
                            } else {
                                showAlert("error", "", "Xóa sân không thành công", "top-end");
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
                                showAlert("error", "", "Xóa sân không thành công", "top-end");
                            }
                            console.error("Response không thành công:", error);
                        });
                };

                // Call deleteYard function after confirmation
                deleteYard();
            }
        });
    };

    handleEditYard = () => {
        const { selectedYard, newYard } = this.state;
        if (!selectedYard || !newYard.yardName.trim()) {
            showAlert("error", "Lỗi!", "Vui lòng chọn sân và nhập tên sân mới.", "top-end");
            return;
        }

        axiosInstance
            .put(`/yard/updateyard`, { yardId: selectedYard, yardName: newYard.yardName })
            .then((res) => {
                if (res.status === 200) {
                    showAlert("success", "Thành công!", "Đã cập nhật sân.", "top-end");
                    this.fetchYardWithCourtID(this.state.selectedCourt);
                    this.setState({ newYard: { yardId: "", yardName: "" }, isEditing: false });
                } else {
                    this.handleRequestError(res);
                }
            })
            .catch((error) => {
                this.handleRequestError(error);
            });
    };

    render() {
        const { selectedYard } = this.state;
        return (
            <div className="yardManager pt-4">
                <div>
                    <div className="flex opAndInputYard" style={{ alignItems: "center", justifyContent: "space-between" }}>
                        <div className="select-court d-flex" style={{ alignItems: "center", justifyContent: "space-between" }}>
                            <label className="me-3">Chọn cơ sở: </label>
                            <select className="" style={{ height: 40 }} onChange={this.handleCourtChange}>
                                {this.renderCourtOption()}
                            </select>
                        </div>

                        {/* <div className="input-group w-50">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Nhập từ khóa"
                                aria-label="Recipient's username"
                                aria-describedby="basic-addon2"
                                value={this.state.searchSlot}
                                onChange={this.handleSearchSlotWithNameOrTime}
                            />
                            <div className="input-group-append">
                                <span className="input-group-text" id="basic-addon2">
                                    <i className="fa fa-search" />
                                </span>
                            </div>
                        </div> */}
                        <div className="w-50 input-group d-flex " id="edit-update-yard">
                            <input
                                className=" bg-light form-control "
                                style={{
                                    boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                                    alignItems: "center",
                                    fontSize: 12,
                                    height: "100%",

                                    justifyContent: "end",
                                }}
                                type="text"
                                placeholder="Nhập tên sân cần thêm"
                                value={this.state.newYard.yardName}
                                onChange={(e) => this.setState({ newYard: { ...this.state.newYard, yardName: e.target.value } })}
                            />
                            <div className="d-flex edit-update-yard">
                                <button type="button" className=" btn btn-outline-primary p-0  m-0" onClick={this.handleAddYard}>
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                                <button class="btn btn-outline-success " type="button " onClick={this.handleEditYard}>
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex my-4" style={{ alignItems: "center", justifyContent: "space-between" }}>
                        <button className="btn btn-primary w-25" data-bs-toggle="modal" data-bs-target="#modalDsSlot">
                            <i className="fa-solid fa-plus"></i> Thêm slot
                        </button>
                    </div>
                    {selectedYard && (
                        <div className="row">
                            <div className="yardWithCourtID col-sm-3 ">
                                <div className="yardItem">{this.renderYardWithCourt()}</div>
                                <button className="btn btn-danger w-100 m-auto " onClick={() => this.handleDeleteYard(this.state.selectedYard)}>
                                    Xóa sân
                                </button>
                            </div>
                            <div className="col-sm-9" id="slotInYard">
                                <div className="overflow-x-auto">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th colSpan={5}>Thông tin các slot trong sân ID: {selectedYard} </th>
                                            </tr>
                                            <tr>
                                                <th>STT</th>
                                                <th>Tên slot</th>
                                                <th className="text-center">Thời gian</th>

                                                <th className="text-center">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>{this.renderSlotInYard()}</tbody>
                                    </table>
                                </div>
                            </div>
                            {this.renderPagination()}
                        </div>
                    )}
                    {!selectedYard && (
                        <div className="mt-4">
                            <p>Chưa có sân được chọn hoặc không có sân nào trong cơ sở này.</p>
                        </div>
                    )}
                </div>

                <div className="modal fade" id="modalDsSlot" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" style={{ marginTop: 65 }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">
                                    Danh sách slot
                                </h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">{this.renderSlotYardHaveNot()}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
