import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

// components
import ActionBar from './Navigation/ActionBar';
import NavigationBar from './Navigation/NavigationBar';


class Home extends Component {
	render () {
		return (
			<div className="home-wrapper">
				<ActionBar {...this.props} />
				<NavigationBar {...this.props} />

				<div>aaa</div>

			</div>
		)
	}
}

export default Home;
