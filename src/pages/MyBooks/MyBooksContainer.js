import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { buildMapStateToProps, buildmapDispatchToProps } from '../../store/reduxDispatchs';

// Redux HOC
import withStore from '../../store/withStore';

// Components
import LayoutWrapper from '../../components/LayoutWrapper';
import MyBooks from './MyBooks';

class MyBooksContainer extends Component {
	// static getDerivedStateFromProps(nextProps, prevState) {
	// 	const { match } = nextProps;
	// 	let id = match.params.id || '';
	// 	let urls_to_fetch = [];
	// 	if (prevState.id === '' || match.params.id !== prevState.id) {
	// 		id = match.params.id || '';
	// 		urls_to_fetch = [`/v2/compras/${match.params.id}`];
	// 	}
	// 	document.title = `#${id} - Compra - Conaz`;
	// 	return { id, urls_to_fetch };
	// }

	state = {};

	componentDidMount() {
		document.title = 'Meus livros - Home Libraries';
		const { getMyBooks } = this.props;
		getMyBooks('/books/mybooks', {});
	}

	render() {
		const { mybooks, user, match } = this.props;
		const { fetching } = mybooks;

		return (
			<LayoutWrapper
				fetching={fetching}
				user={user}
				match={match}>

				<MyBooks
					{...this.state}
					{...this.props} />

			</LayoutWrapper>
		);
	}
}

MyBooksContainer.propTypes = {
	// =========== store
	mybooks: PropTypes.object.isRequired,
	user: PropTypes.object.isRequired,
	// =========== funcs
	updateBook: PropTypes.func.isRequired,
	updateMyBooksRaw: PropTypes.func.isRequired,
	updateUserRaw: PropTypes.func.isRequired,
	// =========== router
	match: PropTypes.object.isRequired,
	// history: PropTypes.object.isRequired,
};

const mapStateToProps = (props) => buildMapStateToProps(props);
const mapDispatchToProps = (dispatch) => buildmapDispatchToProps(dispatch);
export default withStore(connect(mapStateToProps, mapDispatchToProps)(MyBooksContainer));
