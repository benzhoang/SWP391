import React, { Component } from "react";
import "./feedback.css";
export default class Customer extends Component {
    render() {
        return (
            <div className="infomation-Customer">
                <div className="Customer my-4">
                    <div className="avtCus">
                        <img src="https://i.pravatar.cc/4" style={{ width: 50, height: 50 }}></img>
                    </div>
                    <div className="nameCus">
                        <h6>Huỳnh Thị An</h6>
                        <div className="time-rate">
                            <p className="me-2">24/06/2024</p>
                            <p> 6:25</p>
                        </div>
                        <p>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                        </p>
                    </div>
                </div>
                <div className="cmt-Cus">
                    <h6>Dịch vụ rất tuyệt, nhân viên trực quầy dễ thương.</h6>
                </div>
            </div>
        );
    }
}
