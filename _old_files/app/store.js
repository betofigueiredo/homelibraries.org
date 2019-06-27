import { createStore, applyMiddleware, compose } from 'redux';
import { syncHistoryWithStore } from 'react-router-redux';
import { browserHistory } from 'react-router';
// ReduxThunk
import ReduxThunk from 'redux-thunk';
// Root reducer
import rootReducer from './reducers/index';

// Default data
const chat = {
	loading: 0,
	adding: 0,
	id: 0,
	url: '',
	name: '',
	messages: []
};
const libraries = {
	loading: 0,
	search: {
        address: '',
        lat: 0,
        lng: 0,
        radius: 5,
        book_author: '',
        library: '',
        lfl: 0
    },
	data: []
};
const mybooks = { loading: 0, editing: 0, form: '', data: [] };
const profiles = { loading: 0, data: [] };
/*
0: not init
1: checking auth
2: auth ok
3: error auth
4: checking sign in
5: sign in ok
6: error sign in
*/
const user = {
	loading: 0,
	editing: {
		status: 0,
		error: ''
	},
	error: 0,
	logged: false,
	id: 0,
	url: '',
	color: '',
	picture: '',
	name: '',
	address: {
        details: '',
        lat: 0,
        lng: 0
    },
	lfl: {
		number: 0,
		confirmed: false
	},
	language: 'pt-br'
};
const talks = { loading: 0, data: [] };

// Create an object for the default data
const defaultState = {
	chat,
	libraries,
	mybooks,
	profiles,
	user,
	talks
};

const enhancers = compose(window.devToolsExtension ? window.devToolsExtension() : f => f);

const store = createStore(
	rootReducer,
	defaultState,
	compose(
		applyMiddleware(ReduxThunk),
		enhancers
	)
);

export const history = syncHistoryWithStore(browserHistory, store);

if (module.hot) {
	module.hot.accept('./reducers/', () => {
		const nextRootReducer = require('./reducers/index').default;
		store.replaceReducer(nextRootReducer);
	});
}

export default store;
