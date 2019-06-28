/* eslint-disable */
import { setClasses } from './_setClasses';

test('Format class', () => {
	expect(setClasses('step', {})).toBe('step ');
	expect(setClasses('', {})).toBe(' ');
	expect(setClasses('')).toBe(' ');
	expect(setClasses('', null)).toBe(' ');
	expect(setClasses(null, '')).toBe(' ');
	expect(setClasses()).toBe(' ');
});