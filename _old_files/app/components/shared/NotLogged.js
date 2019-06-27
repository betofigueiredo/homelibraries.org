import React from 'react';
import { Link } from 'react-router';
import { translate } from '../../languages/translate';

const NotLogged = ({ origin, locale }) => {
	const originUrl = origin != '' ? `/sign/in/o=${origin}` : '/sign/in';
    return (
        <div className="not-logged-wrapper">
        	<div>{translate[locale].notLogged}</div>
        	<Link to={originUrl}>Click here to sign in</Link>
        </div>
    )
}

NotLogged.defaultProps = {
	origin: ""
}

export default NotLogged;
