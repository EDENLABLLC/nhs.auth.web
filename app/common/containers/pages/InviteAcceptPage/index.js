import React from 'react';
import { connect } from 'react-redux';
import withStyles from 'withStyles';
import { withRouter } from 'react-router';

import { H1 } from 'components/Title';
import Points from 'components/Points';
import ColoredText from 'components/ColoredText';

import InviteAcceptForm from 'containers/forms/InviteAcceptForm';
import { getRequestById } from 'reducers';

import { onSubmit, onReject } from './redux';

import styles from './styles.scss';

@withRouter
@withStyles(styles)
@connect(state => ({
  request: getRequestById(state, state.pages.Invitelayout.request),
}), { onSubmit, onReject })
export default class SignUpStep2Page extends React.Component {
  state = {
    ms: null,
  };
  render() {
    const { onSubmit, onReject, request: { id } } = this.props;

    return (
      <section className={styles.main} id="sign-up-page">
        <header className={styles.header}>
          <H1>Прийняття Регламенту</H1>

          <Points count={2} active={1} />
        </header>
        <article className={styles.content}>
          {
            this.state.ms === 'Email is already used by another person' ? (
              <div>
                <ColoredText color="red">
                  Даний електрониий адрес уже використовується іншою особою
                </ColoredText>
              </div>
            ) : (
              <div>
                <p>
                  Приймаючи запрошення на роботу в системі eHealth ви також <br />
                  погоджуєтесь з положеннями <a rel="noopener noreferrer" target="__blank" href="https://ti-ukraine.org/news/rehlament-funktsionuvannia-pilotnoho-proektu-elektronnoi-systemy-okhorony-zdorov-ia/">Регламенту функціонування системи</a>
                </p>

                <div className={styles.form}>
                  <InviteAcceptForm
                    onSubmit={() => onSubmit(id).then(ms => this.setState({ ms }))}
                  />
                </div>

                <div className={styles.reject}>
                  <button onClick={() => onReject(id)}>Відхилити запрошення</button>
                </div>
              </div>
            )
          }
        </article>
      </section>
    );
  }
}
