import React from 'react';
import axios from 'axios';
import {
  Button, TextField,
} from '@material-ui/core';

// Import Configuration
import config from '../config';

interface IProp {
  onSuccess: () => void,
}
interface IState {
  open: boolean,
  emailInput: string,
  paswdInput: string,

  emailError: boolean,
  paswdError: boolean,
  errorString: string,
}

export default class AuthorzationModel extends React.Component<IProp, IState> {
  constructor(props: IProp) {
    super(props);

    this.state = {
      open: false,
      emailInput: '',
      paswdInput: '',

      emailError: false,
      paswdError: false,
      errorString: '',
    };

    // Bind methods
    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.authorize = this.authorize.bind(this);
  }

  handleClose = () => this.setState({ open: false });
  handleOpen = () => this.setState({ open: true });
  authorize = () => {
    const {
      emailInput, paswdInput,
    } = this.state;

    // Reset error state
    this.setState({ errorString: '', emailError: false, paswdError: false });

    if (!emailInput.length || !paswdInput.length) {
      return this.setState({ 
        errorString: 'Please input credentials',
        emailError: true,
        paswdError: true,
      });
    }

    // Attempt to authorize
    const secure = process.env.REACT_APP_UNSECURE ? false : true; // Defaulted to True
    
    // socket: io(`ws${secure ? 's' : ''}://${config.SERVER_IP}`
    axios.post(`http${secure ? 's' : ''}://${config.SERVER_IP}/v1/auth`, {
      email: emailInput,
      password: paswdInput,
    })
      .then(() => this.props.onSuccess())
      .catch(err => {
        this.setState({
          emailError: true,
          paswdError: true,
          errorString: err.response.data.error[0] || 'Unknown internal error',
        })
      });
  };

  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <TextField
          label="Email"
          variant="standard"
          error={this.state.emailError}
          onChange={elt => this.setState({ emailInput: elt.target.value })} 
        />
        <TextField
          label="Password"
          type='password'
          variant="standard"
          error={this.state.paswdError}
          helperText={this.state.errorString}
          onChange={elt => this.setState({ paswdInput: elt.target.value })} />
        <Button style={{ margin: 10 }} variant='contained' onClick={() => this.authorize()}>Login</Button>

      </div>
    );
  }
};