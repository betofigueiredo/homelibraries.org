import React from 'react';
import Enzyme, { shallow, mount, render } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import InputText from './InputText';

Enzyme.configure({ adapter: new Adapter() });

test('InputText onchange the state value', () => {
	const input = shallow(
		<InputText
			label="test"
			field="test"
			default_value="valor teste"
		/>
	);
	expect(input.state('value'))
		.toEqual('valor teste');
});

test('InputText onchange the state value', () => {
	const input = mount(
		<InputText
			label="test"
			field="test"
		/>
	);
	expect(input.state('value'))
		.toEqual('');
	input.find('input').simulate('change', {
		target: { value: 2 }
	});
	expect(input.state('value')).toEqual('2');
});
