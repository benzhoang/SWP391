import React, { useState, useEffect } from "react";
import axios from "axios";
import { showAlert } from "../../utils/alertUtils";
import { handleTokenError } from "../../utils/tokenErrorHandle";
import axiosInstance from "../../config/axiosConfig";

const Facility = ({ globalCourtId }) => {
    const [facilities, setFacilities] = useState([]);
    const [facilitiesOfCourt, setfacilitiesOfCourt] = useState([]);

    useEffect(() => {
        if (globalCourtId) {
            fetchFacilitiesOfCourt(globalCourtId);
            fetchFacilities();
        }
    }, [globalCourtId]);

    const fetchFacilitiesOfCourt = (courtId) => {
        if (!globalCourtId) return;

        axiosInstance
            .get(`/court/facilities-of-court/${courtId}`)
            .then((response) => {
                setfacilitiesOfCourt(response.data);
            })
            .catch((error) => {
                throw error;
            });
    };

    const fetchFacilities = () => {
        axiosInstance
            .get("/facility/all")
            .then((response) => {
                setFacilities(response.data);
            })
            .catch((error) => {
                throw error;
            });
    };

    const handleAddFacilityToCourt = (facilityId) => {
        axiosInstance
            .post("/facility/all")
            .then((response) => {
                setFacilities(response.data);
            })
            .catch((error) => {
                throw error;
            });
    };

    const handleDeleteFacilityFromCourt = () => {
        axiosInstance
            .delete("/facility/all")
            .then((response) => {
                setFacilities(response.data);
            })
            .catch((error) => {
                throw error;
            });
    };

    return (
        <div className="facilities-for-court">
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Tiện ích</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {facilitiesOfCourt.length === 0 ? (
                        <tr>
                            <td colSpan="3" className="text-center">
                                Cơ sở chưa có tiện ích nào
                            </td>
                        </tr>
                    ) : (
                        facilitiesOfCourt.map((facility, index) => (
                            <tr className="" key={facility.facilityId}>
                                <td className="text-center">{index + 1}</td>
                                <td className="text-center">{facility.facilityName}</td>
                                <td className="d-flex btn-action">
                                    <button className="btn btn-danger" onClick={() => handleDeleteFacilityFromCourt(facility.facilityId)}>
                                        <i className="fa fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Facility;
