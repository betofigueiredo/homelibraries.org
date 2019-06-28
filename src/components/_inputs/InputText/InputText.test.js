/* eslint-disable */

import React from 'react';
import Enzyme, { shallow, mount, render } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
import InputText from './InputText';

Enzyme.configure({ adapter: new EnzymeAdapter() });

jest.mock('react-css-modules', () => InputText => InputText);

test('InputText onchange the state value', () => {
	const input = shallow(
		<InputText
			label="test"
			field="test"
			default_value="valor teste" />
	);
	expect(input.state('value'))
		.toEqual('valor teste');
});

test('InputText onchange the state value', () => {
	const input = mount(
		<InputText
			label="test"
			field="test" />
	);
	expect(input.state('value'))
		.toEqual('');
	input.find('input').simulate('change', {
		target: { value: 2 }
	});
	expect(input.state('value')).toEqual('2');
});

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

// test('To number', () => {
// 	expect(1)
// 		.toBe(1);
// });
