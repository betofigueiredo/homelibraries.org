import { fork, all } from 'redux-saga/effects';

import librariesSaga from './libraries/sagas';
import messagesSaga from './messages/sagas';
import mybooksSaga from './mybooks/sagas';
import userSaga from './user/sagas';

export default function* rootSaga() {
	yield all([
		fork(librariesSaga),
		fork(messagesSaga),
		fork(mybooksSaga),
		fork(userSaga),
	]);
}
