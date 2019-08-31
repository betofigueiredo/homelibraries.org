import React, { Suspense, lazy } from 'react';
import { Route, Switch } from 'react-router-dom';

import LoadingPage from './components/_loadings/LoadingPage/LoadingPage';

// Import Components
import NotFound404 from './pages/NotFound404';
import SignOut from './pages/SignOut';
import SignIn from './pages/SignIn';

const Home = lazy(() => import('./pages/Home'));
const Libraries = lazy(() => import('./pages/Libraries'));
const MyBooks = lazy(() => import('./pages/MyBooks'));
const Messages = lazy(() => import('./pages/Messages'));
const Account = lazy(() => import('./pages/Account/Account'));
const AccountName = lazy(() => import('./pages/Account/AccountName'));
const AccountUrl = lazy(() => import('./pages/Account/AccountUrl'));
const AccountAddress = lazy(() => import('./pages/Account/AccountAddress'));
const AccountMap = lazy(() => import('./pages/Account/AccountMap'));

const Routes = () => (
	<Suspense fallback={<LoadingPage />}>
		<Switch>
			<Route path="/libraries" exact component={Libraries} />
			<Route path="/mybooks" exact component={MyBooks} />
			<Route path="/messages" exact component={Messages} />
			<Route path="/messages/view/:uuid" exact component={Messages} />
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
	</Suspense>
);

export default Routes;
