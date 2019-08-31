import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import CSSModules from 'react-css-modules';
import { connect, useSelector, useDispatch } from 'react-redux';
import { detailedmapDispatchToProps } from '../../store/reduxDispatchs';

// CSS
import styles from './style.module.sass';

// Redux HOC
import withStore from '../../store/withStore';

// Components
import LayoutWrapper from '../../components/LayoutWrapper';
import NotLogged from '../../components/NotLogged';
import AddBookForm from './subcomponents/AddBookForm';
import NoBooks from './subcomponents/NoBooks';
import BooksList from './subcomponents/BooksList';

function MyBooks({
	updateBook,
	updateMyBooksRaw,
}) {
	const dispatch = useDispatch();
	const mybooks = useSelector(store => store.mybooks);
	const { fetching, all_ids } = mybooks;

	useEffect(() => {
		document.title = 'Meus livros - Home Libraries';
		dispatch({ type: 'MYBOOKS_REQUESTED' });
		// on unmount
		return function cleanup() {
			updateMyBooksRaw({ fetching: 0 });
		};
	}, []);

	if (fetching === 40) {
		return <NotLogged />;
	}

	return (
		<LayoutWrapper fetching={fetching}>
			<div className="grid-container" styleName="smaller-grid-container">
				<div className="grid-x grid-padding-x">
					<div className="small-12 cell">
						<h3 styleName="h3">Meus livros</h3>
					</div>
				</div>
				<div className="grid-x grid-padding-x">
					<div className="small-12 cell">
						<AddBookForm
							mybooks={mybooks}
							updateMyBooksRaw={updateMyBooksRaw} />
					</div>
				</div>
				{all_ids.length > 0 ? (
					<BooksList
						mybooks={mybooks}
						updateBook={updateBook}
						updateMyBooksRaw={updateMyBooksRaw} />
				) : (
					<NoBooks />
				)}
			</div>
		</LayoutWrapper>
	);
}

MyBooks.propTypes = {
	updateBook: PropTypes.func.isRequired,
	updateMyBooksRaw: PropTypes.func.isRequired,
};

const dispach_picks = ['updateBook', 'updateMyBooksRaw'];
const mapDispatchToProps = (dispatch) => detailedmapDispatchToProps(dispatch, dispach_picks);
const withCSS = CSSModules(MyBooks, styles, { allowMultiple: true });
export default withStore(connect(null, mapDispatchToProps)(withCSS));
