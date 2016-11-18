import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

class BackBar extends Component {
	render () {
		return (
		    <div className="back-action-bar">
		    	<Link to="/account" className="back-button"><i className="fa fa-angle-left" aria-hidden="true"></i></Link>
		    	<div className="logo"><Link to="/">{this.props.header}</Link></div>
		    </div>
		);
	}
}

BackBar.propTypes = {
  header: PropTypes.string.isRequired,
}

BackBar.defaultProps = {
  header: "HOME LIBRARIES",
}

export default BackBar;
