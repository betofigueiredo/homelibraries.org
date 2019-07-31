import { fork, all } from 'redux-saga/effects';

import librariesSaga from './libraries/sagas';
import uiSaga from './ui/sagas';
import userSaga from './user/sagas';
import messagesSaga from './messages/sagas';
import mybooksSaga from './mybooks/sagas';

export default function* rootSaga() {
	yield all([
		fork(librariesSaga),
		fork(uiSaga),
		fork(userSaga),
		fork(messagesSaga),
		fork(mybooksSaga),
	]);
}
