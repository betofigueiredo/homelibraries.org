import loginRequested from './loginRequested';

it('loginRequested should not crash', () => {
    const test_empty = loginRequested();
    expect(test_empty).toStrictEqual({ logging_in: 10 });

    const test_null = loginRequested(null);
    expect(test_null).toStrictEqual({ logging_in: 10 });

    const test_object = loginRequested({ email: '' });
    expect(test_object).toStrictEqual({ email: '', logging_in: 10 });
});
