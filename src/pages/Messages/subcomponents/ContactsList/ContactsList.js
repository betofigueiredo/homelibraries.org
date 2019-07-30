import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CSSModules from 'react-css-modules';
import { connect } from 'react-redux';
import { buildMapStateToProps, detailedmapDispatchToProps } from '../../../../store/reduxDispatchs';

// Redux HOC
import withStore from '../../../../store/withStore';

// CSS
import styles from './style.module.sass';

// Components
import ContactRow from '../ContactRow';

// Functions
// import { _post } from '../../../../functions/_requests';

class ContactsList extends Component {
	state = {};

	componentDidMount() {
		console.log(this.props);
		// const { getMyMessages } = this.props;
		// getMyMessages('/messages/mybooks', {});
	}

	render() {
		const { contact, mybooks } = this.props;
		console.log(contact, mybooks);

		return (
			<div className="small-5 cell">
				<h3 styleName="h3">Mensagens</h3>
				<ContactRow />
				<ContactRow />
			</div>
		);
	}
}

ContactsList.propTypes = {
	contact: PropTypes.object,
	mybooks: PropTypes.object.isRequired,
};

ContactsList.defaultProps = {
	contact: {},
};

const _ContactsList = CSSModules(ContactsList, styles, { allowMultiple: true });
const store_picks = ['mybooks'];
const dispach_picks = ['updateBook'];
const mapStateToProps = (props) => buildMapStateToProps(props, store_picks);
const mapDispatchToProps = (dispatch) => detailedmapDispatchToProps(dispatch, dispach_picks);
export default withStore(connect(mapStateToProps, mapDispatchToProps)(_ContactsList));
