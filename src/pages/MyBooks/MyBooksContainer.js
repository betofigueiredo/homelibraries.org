import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect, useSelector } from 'react-redux';
import { detailedmapDispatchToProps } from '../../store/reduxDispatchs';

// Redux HOC
import withStore from '../../store/withStore';

// Components
import LayoutWrapper from '../../components/LayoutWrapper';
import MyBooks from './MyBooks';

function MyBooksContainer({
	getMyBooks,
	match,
	updateBook,
	updateMyBooksRaw,
}) {
	const mybooks = useSelector(store => store.mybooks);
	const user = useSelector(store => store.user);

	const { fetching } = mybooks;

	useEffect(() => {
		document.title = 'Meus livros - Home Libraries';
		getMyBooks('/books/mybooks', {});
	}, []);

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

MyBooksContainer.propTypes = {
	// =========== funcs
	getMyBooks: PropTypes.func.isRequired,
	updateBook: PropTypes.func.isRequired,
	updateMyBooksRaw: PropTypes.func.isRequired,
	// =========== router
	match: PropTypes.object.isRequired,
};

const dispach_picks = ['getMyBooks', 'updateBook', 'updateMyBooksRaw'];
const mapDispatchToProps = (dispatch) => detailedmapDispatchToProps(dispatch, dispach_picks);
export default withStore(connect(null, mapDispatchToProps)(MyBooksContainer));
