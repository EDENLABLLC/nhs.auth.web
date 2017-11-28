import { push } from 'react-router-redux';
import { SubmissionError } from 'redux-form';
import { getLocation } from 'reducers';
import { createSessionToken } from 'redux/auth';
import { fetchUserData } from 'redux/user';
import { login } from 'redux/session';
import { CLIENT_ID } from 'config';

export const onSubmit = ({ email, password }) => (dispatch, getState) =>
dispatch(createSessionToken({
  grant_type: 'password',
  email,
  password,
  client_id: CLIENT_ID,
  scope: 'app:authorize',
}))
.then((action) => {
  if (action.error) {
    if (action.payload.status === 401) {
      if (action.payload.response.error.message === 'User blocked.') {
        throw new SubmissionError({
          email: { user_blocked: true },
        });
      } else if (action.payload.response.error.invalid_grant === 'Identity, password combination is wrong.') {
        throw new SubmissionError({
          password: { passwordMismatch: true },
        });
      } else if (action.payload.response.error.invalid_grant === 'Identity not found.') {
        throw new SubmissionError({
          email: { identityMismatch: true },
        });
      }
      return action;
    }
  }
  const { next_step } = action.meta;
  dispatch(login(action.payload.value));

  switch (next_step) {
    case 'REQUEST_APPS': {
      return dispatch(fetchUserData(action.payload.value)).then((action) => {
        if (action.error) {
          throw new SubmissionError({
            email: { accountPasswordMismatch: true },
          });
        }
        const state = getState();
        const location = getLocation(state);

        return dispatch(push({ ...location, pathname: '/accept' }));
      });
    }

    case 'REQUEST_OTP': {
      const state = getState();
      const location = getLocation(state);
      return dispatch(push({ ...location, pathname: '/otp-send' }));
    }

    case 'RESEND_OTP': {
      throw new SubmissionError({
        email: { resentOtp: true },
      });
    }

    case 'REQUEST_FACTOR': {
      const state = getState();
      const location = getLocation(state);
      return dispatch(push({ ...location, pathname: '/request-factor' }));
    }

    default: {
      break;
    }
  }
  return true;
});
