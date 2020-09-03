import React, { useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

// Actions
import { getBooks } from '../../store/actions';

// Components
import LayoutWrapper from '../../../shared/components/LayoutWrapper';
import LoadingBooksList from '../../components/LoadingBooksList';
import BooksList from '../../components/BooksList';

const MyBooksLogged = () => {
	const dispatch = useDispatch();
	const fetching = useSelector(
		store => store.books.fetching, shallowEqual,
	);
	const loading_books = fetching === 0 || fetching === 10;

	useEffect(() => {
		dispatch(getBooks());
	}, []);

	return (
		<LayoutWrapper>
			<div className="grid-container" styleName="smaller-grid-container">
				<div className="grid-x grid-padding-x">
					<div className="small-12 cell">
						<h3 styleName="h3">Meus livros</h3>
					</div>
				</div>
				<div className="grid-x grid-padding-x">
					<div className="small-12 cell">
						{/* <AddBookForm
							mybooks={mybooks}
							updateMyBooksRaw={updateMyBooksRaw}
						/> */}
					</div>
				</div>
				{loading_books ? (
					<LoadingBooksList />
				) : (
					<BooksList />
				)}
			</div>
		</LayoutWrapper>
	);
};

export default CSSModules(MyBooksLogged, styles, { allowMultiple: true });
