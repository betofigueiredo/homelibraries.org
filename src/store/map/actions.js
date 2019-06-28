import { UPDATE_MAP, UPDATE_MAP_RAW } from './types';

export const updateMap = (field, value) => ({ type: UPDATE_MAP, field, value });
export const updateMapRaw = (fields_n_values) => ({ type: UPDATE_MAP_RAW, fields_n_values });
