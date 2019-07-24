import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Loadable from 'react-loadable';

import LoadingPage from './components/_loadings/LoadingPage/LoadingPage';

// Import Components
// import Layout from './hocs/Layout/Layout';
import NotFound404 from './pages/NotFound404/NotFound404';
import SignOut from './pages/SignOut';
import SignIn from './pages/SignIn';

const loading = () => <LoadingPage />;

const asyncHome = Loadable({
	loader: () => import('./pages/Home'),
	loading,
});
const asyncLibraries = Loadable({
	loader: () => import('./pages/Libraries'),
	loading,
});
const asyncMyBooks = Loadable({
	loader: () => import('./pages/MyBooks'),
	loading,
});
const asyncMessages = Loadable({
	loader: () => import('./pages/Messages'),
	loading,
});
const asyncAccount = Loadable({
	loader: () => import('./pages/Account/Account'),
	loading,
});
const asyncAccountName = Loadable({
	loader: () => import('./pages/Account/AccountName'),
	loading,
});
const asyncAccountUrl = Loadable({
	loader: () => import('./pages/Account/AccountUrl'),
	loading,
});
const asyncAccountAddress = Loadable({
	loader: () => import('./pages/Account/AccountAddress'),
	loading,
});
const asyncAccountMap = Loadable({
	loader: () => import('./pages/Account/AccountMap'),
	loading,
});

const Routes = () => (
	<Switch>
		<Route path="/libraries" exact component={asyncLibraries} />
		<Route path="/mybooks" exact component={asyncMyBooks} />
		<Route path="/messages" exact component={asyncMessages} />
		<Route path="/account" exact component={asyncAccount} />
		<Route path="/account/name" exact component={asyncAccountName} />
		<Route path="/account/url" exact component={asyncAccountUrl} />
		<Route path="/account/address" exact component={asyncAccountAddress} />
		<Route path="/account/map" exact component={asyncAccountMap} />
		<Route path="/sign/in" exact component={SignIn} />
		<Route path="/sign/out" exact component={SignOut} />

		{/* 404 e signout */}
		<Route path="/" exact component={asyncHome} />
		<Route path="*" exact component={NotFound404} />
	</Switch>
);

export default Routes;
