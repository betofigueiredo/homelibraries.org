/* eslint-disable */
import React from 'react';
import Enzyme, { shallow, mount, render } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
import BookEdition from './BookEdition';

Enzyme.configure({ adapter: new EnzymeAdapter() });

jest.mock('react-css-modules', () => BookEdition => BookEdition);

const setup = (props = {}, state = null) => {
	return shallow(<BookEdition {...props} />);
};

const findByTestAttr = (wrapper, value) => {
	return wrapper.find(`[data-test="${value}"]`);
};

test('BookEdition render ok', () => {
	const wrapper = setup();
	expect(
		findByTestAttr(wrapper, 'component-bookedition').length
	).toBe(1);
});

test('BookEdition render and changes book title', () => {
	const book = {
		id: 10,
		title: 'Basic Economics',
		author: 'Thomas Sowell',
		link: '',
		available: true,
	};
	const wrapper = mount(
		<BookEdition
			book={book}
			type="edit" />
	);
	expect(wrapper.state('title'))
		.toEqual('Basic Economics');

	expect(wrapper.find('InputText').length).toBe(3);

	const aa = wrapper
		.find('InputText')
		.first()
		.find('input')
		.simulate('change', { target: { value: 'Basicssss' } });

	expect(wrapper.state('title'))
		.toEqual('Basicssss');
});
