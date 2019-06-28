import { takeLatest } from 'redux-saga/effects';
import { UPDATE_USER } from './types';

export function* handleUserAction({ type = '' }) {
	yield console.log('handleUserAction', type); // eslint-disable-line
}

// saga
export default function* userSaga() {
	yield takeLatest([UPDATE_USER], handleUserAction);
}
