import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { translate } from '../../languages/translate';

//<div className="la-ball-clip-rotate"><div></div></div>
class ActionBar extends Component {
	render () {
		const locale = this.props.user.language;
		return (
			<div id="ActionBar" className="action-bar">
				<div className="action-bar__div">
			        <div className="action-bar__logo"><Link to="/">{this.props.header}</Link></div>
			        <nav>
			        	<ul>
			        		<li><Link to="/libraries/" activeClassName="active"><i className="fa fa-map fa-fw"></i> {translate[locale].libraries}</Link></li>
			        		<li><Link to="/mybooks/" activeClassName="active"><i className="fa fa-book fa-fw"></i> {translate[locale].myBooks}</Link></li>
			        		<li><Link to="/messages/" activeClassName="active"><i className="fa fa-comments fa-fw"></i> {translate[locale].messages}</Link></li>
			        		<li><Link to="/account/" activeClassName="active"><i className="fa fa-user fa-fw"></i> {translate[locale].account}</Link></li>
			        	</ul>
			        </nav>
				</div>
			</div>
		);
	}
}

ActionBar.propTypes = {
  header: PropTypes.string.isRequired,
}

ActionBar.defaultProps = {
  header: "HOME LIBRARIES",
}

export default ActionBar;
