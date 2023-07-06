import React from 'react';

import { Link } from 'react-router-dom';

// Styling Libraries
import MaterialSwitch from '@mui/material/Switch';
interface IProp {
  isDarkMode: boolean;
  toggleDarkMode: (state: boolean) => void;
}
interface IState {};

export default class About extends React.Component<IProp, IState> {
  constructor(props: IProp) {
    super(props);

    this.state = {};
  }

  render() {
    const { isDarkMode } = this.props;

    return (
      <>
        <div>
          <strong>About App</strong>
          <p>
            Small application that tracks live Lists of Items so that
            everyone that is on the site/app can simultaneously observer
            changes.
          </p>
          <p>Check out the Open Source Development on <a
            href='https://github.com/Ciaxur/realtime-list.client'
            style={{ color: '#74b9ff' }}
            target='_blank' rel='noopener noreferrer'>GitHub</a>
          </p>
          <p>
            Check out <Link to='/changes' style={{ color: '#74b9ff' }}>New Changes</Link> done to the
            app.
          </p>

          <small>Dark Mode
            <MaterialSwitch
              checked={isDarkMode}
              color='primary'
              onChange={state => this.props.toggleDarkMode(state.currentTarget.checked)} />
          </small>
        </div>
      </>
    );
  }
}