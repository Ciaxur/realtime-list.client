import React from 'react';
import { NavigateFunction } from 'react-router-dom';
import axios from 'axios';
import {
  Button, Link, TextField,
} from '@mui/material';
import { IUserSchema } from '../Interfaces';

// Import Configuration
import config from '../config';
import { withNavigate } from '../HOC/Navigation';

interface IProp {
  onSuccess: () => void,
  navigate?: NavigateFunction;
}
interface IState {
  emailInput: string,
  paswdInput: string,

  emailError: boolean,
  paswdError: boolean,
  errorString: string,
}

class AuthorzationModel extends React.Component<IProp, IState> {
  private emailInputRef: React.RefObject<HTMLDivElement>;

  constructor(props: IProp) {
    super(props);

    this.state = {
      emailInput: '',
      paswdInput: '',

      emailError: false,
      paswdError: false,
      errorString: '',
    };

    // References.
    this.emailInputRef = React.createRef();

    // Bind methods
    this.authorize = this.authorize.bind(this);
    this.handleEnterKey = this.handleEnterKey.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
  }

  componentDidMount(): void {
    this.emailInputRef.current?.focus();
  }

  /**
   * Event handler which invokes authorizing the user upon clicking the Enter key.
   * @param event Triggered keyboard event.
   */
  private handleEnterKey(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key == 'Enter') {
      this.authorize();
    }
  }

  /**
   * Handles routing the user to the register route.
   */
  private handleRegister = () => this.props.navigate && this.props.navigate('/register');

  /**
   * Authorize the user given the valid inputs.
   */
  private authorize = () => {
    const {
      emailInput, paswdInput,
    } = this.state;

    // Extract & Clean Input data
    const email = emailInput.trim();

    // Reset error state
    this.setState({ errorString: '', emailError: false, paswdError: false });

    if (!email.length || !paswdInput.length) {
      return this.setState({
        errorString: 'Please input credentials',
        emailError: true,
        paswdError: true,
      });
    }

    // Attempt to authorize
    const httpProtocol = process.env.REACT_APP_UNSECURE ? 'http' : 'https';

    axios.post(`${httpProtocol}://${config.SERVER_IP}/v1/auth`, {
      email: email,
      password: paswdInput,
    } as IUserSchema, { withCredentials: true })
      .then(() => this.props.onSuccess())
      .catch(err => {
        const errResponse = err.response && (
          (err.response.data.error && err.response.data.error[0]) || err.response.statusText);

        this.setState({
          emailError: true,
          paswdError: true,
          errorString: errResponse
            || 'Unknown internal error',
        });
      });
  };

  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <TextField
          label="Email"
          variant="standard"
          error={this.state.emailError}
          onKeyDown={this.handleEnterKey}
          inputRef={this.emailInputRef}
          onChange={elt => this.setState({ emailInput: elt.target.value })}
        />
        <TextField
          label="Password"
          type='password'
          variant="standard"
          error={this.state.paswdError}
          helperText={this.state.errorString}
          onKeyDown={this.handleEnterKey}
          onChange={elt => this.setState({ paswdInput: elt.target.value })} />

        <Link
          style={{
            paddingTop: '5px',
          }}
          href='#'
          onClick={this.handleRegister}
          variant='overline'>Create Account</Link>
        <Button
          style={{ margin: 10 }}
          variant='contained'
          onClick={() => this.authorize()}>Login</Button>
      </div>
    );
  }
};

export default withNavigate(AuthorzationModel);