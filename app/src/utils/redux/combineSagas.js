import { all, fork } from 'redux-saga/effects';

import booksSaga from '../../modules/Books/store/sagas';
import userSaga from '../../modules/User/store/sagas';

export default function* rootSaga() {
	yield all([
		fork(booksSaga),
		fork(userSaga),
	]);
}
