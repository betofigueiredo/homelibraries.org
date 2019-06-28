import React from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';
import monitorReducersEnhancer from '../utils/enhancers/monitorReducer';
import loggerMiddleware from '../utils/middleware/logger';

// sagas
import rootSaga from './combineSagas';

// reducers
import libraries from './libraries/reducers';
import map from './map/reducers';
import mybooks from './mybooks/reducers';
import search from './search/reducers';
import ui from './ui/reducers';
import user from './user/reducers';

const reducers = combineReducers({
	libraries,
	map,
	mybooks,
	search,
	ui,
	user,
});

const sagaMiddleware = createSagaMiddleware();
const middlewares = [loggerMiddleware, sagaMiddleware];
const middlewareEnhancer = applyMiddleware(...middlewares);
const enhancers = [middlewareEnhancer, monitorReducersEnhancer];
const composedEnhancers = composeWithDevTools(...enhancers);
const store = createStore(reducers, composedEnhancers);

sagaMiddleware.run(rootSaga);

const withStore = Page => (props) => (
	<Provider store={store}>
		<Page {...props} />
	</Provider>
);

export default withStore;
