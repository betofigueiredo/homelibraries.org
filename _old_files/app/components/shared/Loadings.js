import React from 'react';

export const Loading = () => {
    return (
        <div className="timeline-item">
            <div className="animated-background">
                <div className="background-masker content-top"></div>
                <div className="background-masker content-second-line"></div>
                <div className="background-masker content-third-line"></div>
                <div className="background-masker content-third-end"></div>
            </div>
            <div className="animated-background">
                <div className="background-masker content-top"></div>
                <div className="background-masker content-second-line"></div>
                <div className="background-masker content-third-line"></div>
                <div className="background-masker content-third-end"></div>
            </div>
        </div>
    )
}
