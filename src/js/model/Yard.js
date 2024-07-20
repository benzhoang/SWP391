import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Yard() {
    const [yards, setYards] = useState([]);
    const [slots, setSlots] = useState([]);
    const [newYard, setNewYard] = useState({ nameYard: "", Slot: [], nameCourt: "", id: "" });
    const [newSlot, setNewSlot] = useState({ nameSlot: "", timeFrame: "", yardId: "", id: "" });
    const [selectedYardId, setSelectedYardId] = useState(null);
    const [selectedYard, setSelectedYard] = useState(null); // Khai báo biến selectedYard

    useEffect(() => {
        fetchYards();
        fetchSlots();
    }, []);

    const fetchYards = async () => {
        try {
            const response = await axios.get("https://662b9fd1de35f91de158edc0.mockapi.io/yard");
            setYards(response.data);
        } catch (error) {
            console.error("Error fetching yards:", error);
        }
    };

    const fetchSlots = async () => {
        try {
            const response = await axios.get("https://662b9fd1de35f91de158edc0.mockapi.io/slot");
            setSlots(response.data);
        } catch (error) {
            console.error("Error fetching slots:", error);
        }
    };

    const addYard = async () => {
        try {
            const response = await axios.post("https://662b9fd1de35f91de158edc0.mockapi.io/yard", newYard);
            setYards([...yards, response.data]);
            setNewYard({ nameYard: "", Slot: [], imgYard: "" });
        } catch (error) {
            console.error("Error adding yard:", error);
        }
    };

    const addSlot = async () => {
        try {
            const response = await axios.post("https://662b9fd1de35f91de158edc0.mockapi.io/slot", newSlot);
            setSlots([...slots, response.data]);
            setNewSlot({ nameSlot: "", timeFrame: "", yardId: "" });
        } catch (error) {
            console.error("Error adding slot:", error);
        }
    };

    const updateYard = async (id, updatedYard) => {
        try {
            const response = await axios.put(`https://662b9fd1de35f91de158edc0.mockapi.io/yard/${id}`, updatedYard);
            setYards(yards.map((yard) => (yard.id === id ? response.data : yard)));
        } catch (error) {
            console.error("Error updating yard:", error);
        }
    };

    const updateSlot = async (id, updatedSlot) => {
        try {
            const response = await axios.put(`https://662b9fd1de35f91de158edc0.mockapi.io/slot/${id}`, updatedSlot);
            setSlots(slots.map((slot) => (slot.id === id ? response.data : slot)));
        } catch (error) {
            console.error("Error updating slot:", error);
        }
    };

    const deleteYard = async (id) => {
        try {
            await axios.delete(`https://662b9fd1de35f91de158edc0.mockapi.io/yard/${id}`);
            setYards(yards.filter((yard) => yard.id !== id));
        } catch (error) {
            console.error("Error deleting yard:", error);
        }
    };

    const deleteSlot = async (id) => {
        try {
            await axios.delete(`https://662b9fd1de35f91de158edc0.mockapi.io/slot/${id}`);
            setSlots(slots.filter((slot) => slot.id !== id));
        } catch (error) {
            console.error("Error deleting slot:", error);
        }
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        if (id === "yardId" || id === "nameSlot") {
            setNewSlot({ ...newSlot, [id]: value });
        } else if (id === "timeFrame") {
            setNewSlot({ ...newSlot, timeFrame: value });
        } else {
            setNewYard({ ...newYard, [id]: value });
        }
    };

    const handleDetailClick = (yard) => {
        const yardSlots = slots.filter((slot) => slot.yardId === yard.id);
        setSelectedYard({ ...yard, Slot: yardSlots });
    };

    return (
        <div>
            <ul className="nav nav-tabs mb-4" id="myTab" role="tablist">
                {yards.map((yard, index) => (
                    <li className="nav-item" role="presentation" key={yard.id}>
                        <a
                            className={`nav-link ${selectedYardId === yard.id ? "active" : ""}`}
                            id={`${yard.id}-tab`}
                            data-bs-toggle="tab"
                            href={`#${yard.id}`}
                            role="tab"
                            aria-controls={yard.id}
                            aria-selected={selectedYardId === yard.id ? "true" : "false"}
                            onClick={() => {
                                setSelectedYardId(yard.id);
                                handleDetailClick(yard);
                            }}
                        >
                            {yard.nameYard}
                        </a>
                    </li>
                ))}
                <li className="nav-item" role="presentation">
                    <a
                        className="nav-link disabled"
                        id="disabled-tab"
                        data-bs-toggle="tab"
                        href="#disabled"
                        role="tab"
                        aria-controls="disabled"
                        aria-selected="false"
                        aria-disabled="true"
                    >
                        Thông tin sân
                    </a>
                </li>
            </ul>

            <div className="tab-content" id="myTabContent">
                {yards.map((yard) => (
                    <div
                        key={yard.id}
                        className={`tab-pane fade ${selectedYardId === yard.id ? "show active" : ""}`}
                        id={yard.id}
                        role="tabpanel"
                        aria-labelledby={`${yard.id}-tab`}
                    >
                        {selectedYardId === yard.id && (
                            <div className="row">
                                <div className="table-yard-info col-lg-7">
                                    <table className="table table-striped table-hover">
                                        <thead>
                                            <tr>
                                                <th colSpan={4} className="text-center">
                                                    {yard.nameYard}
                                                </th>
                                            </tr>
                                            <tr>
                                                <th className="text-start">Slot</th>
                                                <th className="text-start">Thời gian</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <td></td>
                                            <td></td>
                                            <td className="d-flex">
                                                <button className="btn" onClick={() => handleDetailClick(yard.id)}>
                                                    <i className="fa-solid fa-circle-info"></i>
                                                </button>
                                                <button className="btn">
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button className="btn" onClick={() => deleteSlot(yard.id)}>
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </td>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Hiển thị các slot khác */}
                                <div className="table-slot col-lg-5">
                                    <table className="table table-striped table-hover">
                                        <thead>
                                            <tr>
                                                <th colSpan={4} className="text-center">
                                                    Slot
                                                </th>
                                            </tr>
                                            <tr>
                                                <th>Tên Slot</th>
                                                <th>Khung giờ</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {slots.map((slot) => (
                                                <tr key={slot.id}>
                                                    <td className="text-center">{slot.nameSlot}</td>
                                                    <td className="text-center">{slot.timeFrame}</td>
                                                    <td className="d-flex">
                                                        <button className="btn" onClick={() => console.log(slot)}>
                                                            <i className="fa-solid fa-circle-info"></i>
                                                        </button>
                                                        <button className="btn">
                                                            <i className="fa-solid fa-pen-to-square"></i>
                                                        </button>
                                                        <button className="btn" onClick={() => deleteSlot(slot.id)}>
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal thêm mới sân */}
            <div className="modal fade" id="addYard" tabIndex="-1" aria-labelledby="addYardLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title" id="addYardLabel">
                                Thêm mới sân
                            </h4>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="nameYard">Tên sân</label>
                                <input
                                    id="nameYard"
                                    className="form-control"
                                    placeholder="Nhập tên sân"
                                    value={newYard.nameYard}
                                    onChange={handleInputChange}
                                />
                            </div>
                            {/* <div className="form-group">
                                <label htmlFor="imgYard">Link hình ảnh</label>
                                <input
                                    id="imgYard"
                                    className="form-control"
                                    placeholder="Nhập link hình ảnh"
                                    value={newYard.imgYard}
                                    onChange={handleInputChange}
                                />
                            </div> */}
                            <div className="form-group">
                                <button className="btn btn-success" data-bs-dismiss="modal" onClick={addYard}>
                                    Tạo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal thêm mới slot */}
            <div className="modal fade" id="addSlot" tabIndex="-1" aria-labelledby="addSlotLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title" id="addSlotLabel">
                                Thêm mới slot
                            </h4>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="nameSlot">Tên Slot</label>
                                <input
                                    id="nameSlot"
                                    className="form-control"
                                    placeholder="Nhập tên slot"
                                    value={newSlot.nameSlot}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="timeFrame">Khung giờ</label>
                                <input
                                    id="timeFrame"
                                    className="form-control"
                                    placeholder="Nhập khung giờ"
                                    value={newSlot.timeFrame}
                                    onChange={handleInputChange}
                                />
                            </div>
                            {/* <div className="form-group">
                                <label htmlFor="yardId">ID sân cần thêm Slot</label>
                                <input
                                    id="yardId"
                                    className="form-control"
                                    placeholder="Nhập ID sân"
                                    value={newSlot.yardId}
                                    onChange={handleInputChange}
                                />
                            </div> */}
                            <div className="form-group">
                                <button className="btn btn-success" data-bs-dismiss="modal" onClick={addSlot}>
                                    Tạo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
