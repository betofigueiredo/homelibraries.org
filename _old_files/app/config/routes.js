import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import store, { history } from '../store';

// Import Components
import App from '../components/App';
import Home from '../components/Home';
import MyBooks from '../components/MyBooks/MyBooks';
import EditBook from '../components/MyBooks/EditBook';
import Messages from '../components/Messages/Messages';
import Chat from '../components/Messages/Chat';
import LibrariesNProfiles from '../components/LibrariesNProfiles';
import SignIn from '../components/SignIn';
import SignUp from '../components/SignUp';
import Account from '../components/Account/Account';
import AccountName from '../components/Account/AccountName';
import AccountUrl from '../components/Account/AccountUrl';
import AccountAddress from '../components/Account/AccountAddress';
import AccountMap from '../components/Account/AccountMap';
import AccountLfl from '../components/Account/AccountLfl';
import AccountEmail from '../components/Account/AccountEmail';
import AccountLanguage from '../components/Account/AccountLanguage';

const routes = (
	<Provider store={store}>
		<Router history={history}>
			<Route path="/" component={App}>
				<IndexRoute component={Home}></IndexRoute>
				<Route path='mybooks' component={MyBooks} />
				<Route path='mybooks/edit/:id' component={EditBook} />
				<Route path='messages' component={Messages} />
				<Route path='messages/:id' component={Chat} />
				<Route path='account' component={Account} />
				<Route path='account/name' component={AccountName} />
				<Route path='account/url' component={AccountUrl} />
				<Route path='account/address' component={AccountAddress} />
				<Route path='account/map' component={AccountMap} />
				<Route path='account/lfl' component={AccountLfl} />
				<Route path='account/email' component={AccountEmail} />
				<Route path='account/language' component={AccountLanguage} />
				<Route path='sign/in' component={SignIn} />
				<Route path='sign/in/(:origin)' component={SignIn} />
				<Route path='sign/up' component={SignUp} />
				<Route path='sign/up/(:origin)' component={SignUp} />
				<Route path='libraries' component={LibrariesNProfiles} />
				<Route path='search' component={LibrariesNProfiles} />
				<Route path='*' component={LibrariesNProfiles} />
			</Route>
		</Router>
	</Provider>
);

export default routes;
