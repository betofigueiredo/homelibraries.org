import React from 'react';
import { useSelector } from 'react-redux';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

// Selectors
import { userLoggedSelector } from '../../../User/store/selectors';

// Components
import MyBooksLogged from './MyBooksLogged';
import MyBooksNotLogged from './MyBooksNotLogged';

const MyBooks = () => {
	const is_user_logged = useSelector(userLoggedSelector);

	if (!is_user_logged) {
		return <MyBooksNotLogged />;
	}

	return <MyBooksLogged />;
};

export default CSSModules(MyBooks, styles, { allowMultiple: true });
