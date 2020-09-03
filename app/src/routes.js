import React, { Suspense, lazy } from 'react';
import { Route, Switch } from 'react-router-dom';

// Loading
import LoadingPage from './modules/shared/components/LoadingPage';

// Pages
const MyBooks = lazy(() => import('./modules/Books/pages/MyBooks'));
const SignIn = lazy(() => import('./modules/User/pages/SignIn'));

const Routes = () => (
	<Suspense fallback={<LoadingPage />}>
		<Switch>
			<Route path="/sign/in" exact component={SignIn} />
			<Route path="/mybooks" exact component={MyBooks} />
			<Route path="/" exact component={MyBooks} />
			<Route path="*" exact component={MyBooks} />
		</Switch>
	</Suspense>
);

export default Routes;
