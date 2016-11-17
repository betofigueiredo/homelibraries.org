import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

class NavigationBar extends Component {
	render() {
		const profileUrl = `/${this.props.user.url}`;

		return (
		    <div className="navigation-bar">
		        <div className="row collapse">
		            <div className="small-3 medium-3 large-3 columns">
		            	<Link to="/libraries/" className="navigation-bar__link" activeClassName="active"><i className="fa fa-map"></i></Link>
		            </div>
		            <div className="small-3 medium-3 large-3 columns">
		            	<Link to="/mybooks/" className="navigation-bar__link" activeClassName="active"><i className="fa fa-book"></i></Link>
		            </div>
		            <div className="small-3 medium-3 large-3 columns">
		                <Link to="/messages/" className="navigation-bar__link" activeClassName="active"><i className="fa fa-comments"></i></Link>
		            </div>
		            <div className="small-3 medium-3 large-3 columns">
		            	<Link to="/account/" className="navigation-bar__link" activeClassName="active"><i className="fa fa-user"></i></Link>
		            </div>
		        </div>
		    </div>
		)
	}
}

export default NavigationBar;
