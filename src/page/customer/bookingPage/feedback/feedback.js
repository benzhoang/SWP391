import React, { Component } from "react";
import "./feedback.css";
import Customer from "./Customer";

export default class feedback extends Component {
    render() {
        return (
            <div className="feedbackCus p-4">
                <h3>Đánh giá</h3>
                <div className="feedback-title mb-5">
                    <div className="feedback-left">
                        <p className="fb-rate me-4">5.0</p>
                        <p className="">
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                        </p>
                    </div>

                    <div className="feedback-right">
                        <i class="fa-regular fa-comment"></i>
                    </div>
                </div>

                <div className="customer-item">
                    <Customer />
                    <Customer />
                    <Customer />
                </div>
                <div className="show-more ">
                    {" "}
                    <button>
                        Hiện thêm <i class="fa-solid fa-chevron-down"></i>
                    </button>
                </div>
            </div>
        );
    }
}
