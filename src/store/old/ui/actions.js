import { UPDATE_UI, UPDATE_UI_RAW } from './types';

export const updateUi = (field, value) => ({ type: UPDATE_UI, field, value });
export const updateUiRaw = (fields_n_values) => ({ type: UPDATE_UI_RAW, fields_n_values });
