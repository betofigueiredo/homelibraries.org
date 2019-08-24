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
import ChatMessage from '../ChatMessage';

// Functions
// import { _post } from '../../../../functions/_requests';

class Chat extends Component {
	state = {};

	componentDidMount() {
		console.log(this.props);
		// const { getMyMessages } = this.props;
		// getMyMessages('/messages/mybooks', {});
	}

	render() {
		const { contact, mybooks } = this.props;
		console.log(contact, mybooks);

		const message1 = {
			book_confirmed: false,
			created: '2019-08-04 00:00:00',
			id: 1,
			id_book: 0,
			id_received: '2171031043843683927164bc870ad631',
			id_send: '865a038fe1b610e6d7269c4d6786f505',
			is_read: false,
			message: 'Generate professional reports in just 3 seconds! Stop wasting time with manual tasks, increase your customer base, and improve the quality of your service',
			mine: false,
		};
		const message2 = {
			book_confirmed: false,
			created: '2019-08-04 00:00:00',
			id: 2,
			id_book: 0,
			id_received: '865a038fe1b610e6d7269c4d6786f505',
			id_send: '2171031043843683927164bc870ad631',
			is_read: false,
			message: 'Build progressive websites with simple dragndrop',
			mine: true,
		};

		return (
			<div className="small-7 cell">
				<div>barra superior</div>
				<ChatMessage
					message={message1} />
				<ChatMessage
					message={message2} />
			</div>
		);
	}
}

Chat.propTypes = {
	contact: PropTypes.object,
	mybooks: PropTypes.object.isRequired,
};

Chat.defaultProps = {
	contact: {},
};

const _Chat = CSSModules(Chat, styles, { allowMultiple: true });
const store_picks = ['mybooks'];
const dispach_picks = ['updateBook'];
const mapStateToProps = (props) => buildMapStateToProps(props, store_picks);
const mapDispatchToProps = (dispatch) => detailedmapDispatchToProps(dispatch, dispach_picks);
export default withStore(connect(mapStateToProps, mapDispatchToProps)(_Chat));
