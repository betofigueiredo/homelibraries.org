import React, { Component } from 'react';
import { Link } from 'react-router';

class Main extends Component {
    componentWillMount() {
    	this.props.checkAuth();
    }
	render () {
		return (
			<div className="main-wrapper">
				{React.cloneElement(this.props.children, this.props)}
			</div>
		);
	}
}

export default Main;
