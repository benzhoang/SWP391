import React from 'react';
import './index.css'; // Ensure you have appropriate CSS for the spinner
import spin from '../../assets/images/spin.svg';

const Spinner = () => (
    <div className="spinner-overlay">
        <div className="spinner">
            <div className="spinner-icon">
            <img src={spin} alt="Loading..." className="spinner-svg" />
            </div>
            <div className="spinner-circle"></div>
        </div>
    </div>
);

export default Spinner;
