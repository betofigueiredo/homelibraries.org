import { takeLatest } from 'redux-saga/effects';
import { UPDATE_UI } from './types';

export function* handleUiAction({ type = '' }) {
	yield console.log('handleUiAction', type); // eslint-disable-line
}

// saga
export default function* uiSaga() {
	yield takeLatest([UPDATE_UI], handleUiAction);
}
