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
	componentDidMount() {
		document.title = 'Meus livros - Home Libraries';
		const { getMyBooks } = this.props;
		getMyBooks('/books/mybooks', {});
	}

	render() {
		const {
			mybooks,
			user,
			match,
			updateBook,
			updateMyBooksRaw,
		} = this.props;
		const { fetching } = mybooks;

		return (
			<LayoutWrapper
				fetching={fetching}
				user={user}
				match={match}>

				<MyBooks
					mybooks={mybooks}
					updateBook={updateBook}
					updateMyBooksRaw={updateMyBooksRaw} />

			</LayoutWrapper>
		);
	}
}

MyBooksContainer.propTypes = {
	// =========== store
	mybooks: PropTypes.object.isRequired,
	user: PropTypes.object.isRequired,
	// =========== funcs
	getMyBooks: PropTypes.func.isRequired,
	updateBook: PropTypes.func.isRequired,
	updateMyBooksRaw: PropTypes.func.isRequired,
	// =========== router
	match: PropTypes.object.isRequired,
	// history: PropTypes.object.isRequired,
};

const mapStateToProps = (props) => buildMapStateToProps(props);
const mapDispatchToProps = (dispatch) => buildmapDispatchToProps(dispatch);
export default withStore(connect(mapStateToProps, mapDispatchToProps)(MyBooksContainer));
