import React, { Component } from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

class SideBar extends Component {
	state = {
		show: false,
	};

	componentDidMount() {
		setTimeout(() => this.setState({ show: true }), 60);
		setTimeout(() => {
			window.addEventListener('keyup', this.escClose);
		}, 400);
	}

	componentWillUnmount() {
		window.removeEventListener('keyup', this.escClose);
	}

	escClose = (e) => {
		if (e.keyCode === 27) {
			this.props.closeSidebar();
		}
	}

	render() {
		const { children } = this.props;
		const { show } = this.state;
		const wrapper_class = show
			? 'sidebar-wrapper in'
			: 'sidebar-wrapper';

		return (
			<div styleName={wrapper_class}>
				{React.cloneElement(children)}
			</div>
		);
	}
}


SideBar.propTypes = {
	children: PropTypes.object.isRequired,
	closeSidebar: PropTypes.func.isRequired,
};

export default CSSModules(SideBar, styles, { allowMultiple: true });
