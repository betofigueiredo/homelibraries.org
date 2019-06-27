import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

const TalkRow = ({ chatId, name, letters, location, color }) => {
	const chatUrl = `/messages/${chatId}/`;
    return (
	    <div className="expanded collapse row">
	        <div className="small-12 columns">
	            <Link to={chatUrl}>
	                <div className="messages-row">
	                    <div className="messages-row-name">{name}</div>
	                    <div className="messages-row-content">{location}</div>
	                    <div className="messages-row-profile-pic" style={{backgroundColor: `${color}`}}>{letters}</div>
	                </div>
	            </Link>
	        </div>
	    </div>
    )
}

export default TalkRow;
