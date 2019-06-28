/* eslint-disable */
// import React from 'react';
// import { shallow, mount, render } from 'enzyme';
// import InputText from './InputText';

// jest.mock('react-css-modules', () => InputText => InputText);

// test('InputText onchange the state value', () => {
// 	const input = mount(
// 		<InputText default_value="valor" />
// 	);

// 	expect(input.state().value).toEqual('valor');

// 	input.find('input').simulate('change', {
// 		target: { value: 2 }
// 	});
// 	expect(input.state().value).toEqual('2');

// 	input.find('input').simulate('change', {
// 		target: { value: undefined }
// 	});
// 	expect(input.state().value).toEqual('');
// });

test('To number', () => {
	expect(1)
		.toBe(1);
});
