import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

// styles
import './styles/foundation/foundation.scss';
import './styles/app.scss';

import Auxlr from './modules/shared/hocs/Auxlr';
import Routes from './routes';
import * as serviceWorker from './serviceWorker';

const app = (
	<Auxlr>
		<BrowserRouter>
			<Routes />
		</BrowserRouter>
	</Auxlr>
);

ReactDOM.render(app, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
