import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Loadable from 'react-loadable';

import LoadingPage from './components/_loadings/LoadingPage/LoadingPage';

// Import Components
import NotFound404 from './pages/NotFound404';
import SignOut from './pages/SignOut';
import SignIn from './pages/SignIn';

const loading = () => <LoadingPage />;

const Home = Loadable({
	loader: () => import('./pages/Home'),
	loading,
});
const Libraries = Loadable({
	loader: () => import('./pages/Libraries'),
	loading,
});
const MyBooks = Loadable({
	loader: () => import('./pages/MyBooks'),
	loading,
});
const Messages = Loadable({
	loader: () => import('./pages/Messages'),
	loading,
});
const Account = Loadable({
	loader: () => import('./pages/Account/Account'),
	loading,
});
const AccountName = Loadable({
	loader: () => import('./pages/Account/AccountName'),
	loading,
});
const AccountUrl = Loadable({
	loader: () => import('./pages/Account/AccountUrl'),
	loading,
});
const AccountAddress = Loadable({
	loader: () => import('./pages/Account/AccountAddress'),
	loading,
});
const AccountMap = Loadable({
	loader: () => import('./pages/Account/AccountMap'),
	loading,
});

const Routes = () => (
	<Switch>
		<Route path="/libraries" exact component={Libraries} />
		<Route path="/mybooks" exact component={MyBooks} />
		<Route path="/messages" exact component={Messages} />
		<Route path="/messages/:uuid" exact component={Messages} />
		<Route path="/account" exact component={Account} />
		<Route path="/account/name" exact component={AccountName} />
		<Route path="/account/url" exact component={AccountUrl} />
		<Route path="/account/address" exact component={AccountAddress} />
		<Route path="/account/map" exact component={AccountMap} />
		<Route path="/sign/in" exact component={SignIn} />
		<Route path="/sign/out" exact component={SignOut} />

		{/* 404 e signout */}
		<Route path="/" exact component={Home} />
		<Route path="*" exact component={NotFound404} />
	</Switch>
);

export default Routes;
