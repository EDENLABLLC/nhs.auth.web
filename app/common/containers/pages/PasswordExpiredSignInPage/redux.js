import { push } from 'react-router-redux';
import { SubmissionError } from 'redux-form';
import { getLocation } from 'reducers';
import { createSessionToken } from 'redux/auth';
import { CLIENT_ID } from 'config';
import { login } from 'redux/session';
import error_messages from 'helpers/errors';

export const onSubmit = ({ email, password }) => (dispatch, getState) =>
dispatch(createSessionToken({
  grant_type: 'change_password',
  scope: 'user:change_password',
  client_id: CLIENT_ID,
  email,
  password,
}))
.then((action) => {
  if (action.error) {
    const { message } = action.payload.response.error;
    const error = error_messages[message] || error_messages.defaultError;

    if (message) {
      throw new SubmissionError({
        email: {
          [error]: true,
        },
      });
    }
    return action;
  }
  dispatch(login(action.payload.value));
  const state = getState();
  const location = getLocation(state);

  const { next_step } = action.meta;

  switch (next_step) {
    case 'REQUEST_APPS': {
      return dispatch(push({
        ...location,
        pathname: 'update-password/new',
      }));
    }

    case 'REQUEST_FACTOR': {
      const state = getState();
      const location = getLocation(state);
      return dispatch(push({
        query: {
          ...location.query,
          password_update: true,
        },
        pathname: '/update-password/factor',
      }));
    }

    case 'REQUEST_OTP': {
      const state = getState();
      const location = getLocation(state);
      return dispatch(push({
        ...location,
        pathname: 'update-password/otp',
      }));
    }
    default:
      return action;
  }
});
