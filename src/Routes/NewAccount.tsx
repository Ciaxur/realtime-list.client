import React from 'react';
import { NavigateFunction } from 'react-router-dom';
import axios from 'axios';
import {
  Button,
  Checkbox,
  FormControl,
  Link,
  TextField,
  FormHelperText,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { blue } from '@mui/material/colors';
import { withNavigate } from '../HOC/Navigation';
import { IUserSchema } from '../Interfaces';

// Import Configuration
import config from '../config';

interface IProp {
  navigate?:    NavigateFunction;
}
interface IState {
  emailInput:           string;
  paswdInput:           string;
  paswdConfirmInput:    string;

  emailError:           boolean;
  paswdError:           boolean;
  errorString:          string;

  // TOS
  tosDialogOpen:        boolean;
  termsChecboxChecked:  boolean;
  formError:           boolean;
  formErrorString:     string;
}

class NewAccount extends React.Component<IProp, IState> {
  private emailInputRef: React.RefObject<HTMLDivElement>;

  constructor(props: IProp) {
    super(props);

    this.state = {
      // Initial error states.
      emailError: false,
      paswdError: false,
      errorString: '',

      emailInput: '',
      paswdInput: '',
      paswdConfirmInput: '',

      tosDialogOpen: false,
      termsChecboxChecked: false,
      formError: false,
      formErrorString: '',
    };

    // References.
    this.emailInputRef = React.createRef();

    // Binds.
    this.onCreateAccount = this.onCreateAccount.bind(this);
    this.handleEnterKey = this.handleEnterKey.bind(this);
    this.handleTOS = this.handleTOS.bind(this);
    this.handleTOSAgreement = this.handleTOSAgreement.bind(this);
  }

  componentDidMount(): void {
    // TODO: Grab TOS from backend.

    this.emailInputRef.current?.focus();
  }

  /**
   * Event handler which invokes registering the user upon clicking the Enter key.
   * @param event Triggered keyboard event.
   */
  private handleEnterKey(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key == 'Enter') {
      this.onCreateAccount();
    }
  }

  /**
   * Handles opening the TOS dialog.
   */
  private handleTOS() {
    this.setState({
      tosDialogOpen: true,
    });
  }

  /**
   * Handles user agreement to the TOS.
   * @param userAgrees State of user's agreement.
   */
  private handleTOSAgreement(userAgrees: boolean) {
    this.setState({
      tosDialogOpen: false,
      termsChecboxChecked: userAgrees,
    });
  }

  private onCreateAccount() {
    // Reset error state.
    this.setState({
      emailError: false,
      paswdError: false,
      errorString: '',

      formError: false,
      formErrorString: '',
    });

    // Basic verification.
    if (this.state.emailInput === '' || this.state.paswdInput === '' || this.state.paswdConfirmInput === '') {
      this.setState({
        emailError: true,
        paswdError: true,
        errorString: 'Ensure all inputs are filled in',
      });
      return;
    }

    // Verify passwords match.
    const password = this.state.paswdInput;
    const passwordConfirm = this.state.paswdConfirmInput;
    if (password !== passwordConfirm) {
      this.setState({
        paswdError: true,
        errorString: 'Passwords do not match',
      });
      return;
    }

    // Verify that the user accepted the terms.
    if (!this.state.termsChecboxChecked) {
      this.setState({
        formError: true,
        formErrorString: 'Please accept the terms and conditions before proceeding',
      });
      return;
    }

    // Attempt to create an account.
    const httpProtocol = process.env.REACT_APP_UNSECURE ? 'http' : 'https';
    axios.post(`${httpProtocol}://${config.SERVER_IP}/v1/auth/create`, {
      email: this.state.emailInput.trim(),
      password: this.state.paswdInput,
    } as IUserSchema,
    {
      withCredentials: true,
    })
      .then(res => {
        this.setState({
          formErrorString: res.data.message || 'Account created successfuly',
        }, ()=> {
          // On success, go to login screen.
          if(this.props.navigate) {
            this.props.navigate('/login');
          }
        });
      })
      .catch(err => {
        console.log('error', err);
        // Extract what kind of error occurred.
        let errorMessage= err.message;
        if (err.response.data.error && err.response.data.error.length) {
          errorMessage = err.response.data.error[0];
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }

        this.setState({
          formError: true,
          formErrorString: errorMessage || 'Unknown error occurred',
        });
      });
  }

  render() {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
      }}>
        <TextField
          label='Email'
          variant='standard'
          onKeyDown={this.handleEnterKey}
          inputRef={this.emailInputRef}
          error={this.state.emailError}
          onChange={elt => this.setState({ emailInput: elt.target.value })}
        />
        <TextField
          label='Password'
          variant='standard'
          type='password'
          error={this.state.paswdError}
          onKeyDown={this.handleEnterKey}
          onChange={elt => this.setState({ paswdInput: elt.target.value })}
        />
        <TextField
          label='Confirm Password'
          variant='standard'
          type='password'
          error={this.state.paswdError}
          helperText={this.state.errorString}
          onChange={elt => this.setState({ paswdConfirmInput: elt.target.value })}
          onKeyDown={this.handleEnterKey}
        />

        <Button
          style={{
            marginTop: '20px',
            marginBottom: '-5px',
          }}
          onClick={this.onCreateAccount}
          variant='contained'>Register
        </Button>

        <FormControl
          error={this.state.formError}
          component="fieldset"
          sx={{ m: 3 }}
          variant="standard"
        >
          <Typography variant='subtitle1'>
            <Checkbox
              checked={this.state.termsChecboxChecked}
              onChange={checked => this.setState({ termsChecboxChecked: checked.target.checked })}
              sx={{
                color: blue[300],
              }} />
            I accept the <Link href='#' onClick={this.handleTOS}>Terms of Service and Privacy Policy</Link>
          </Typography>

          { this.state.formErrorString && <FormHelperText>{this.state.formErrorString}</FormHelperText> }
        </FormControl>


        {/* TOS Dialog Logic */}
        <Dialog
          open={this.state.tosDialogOpen}
          onClose={() => this.setState({tosDialogOpen: false})}
          maxWidth='lg'
        >
          <DialogTitle variant='h5'>Terms of Service</DialogTitle>
          <DialogContent>
            These Terms of Service ("Terms") govern your use of the web application and related services ("the Application") for tracking a user's shopping list. By accessing or using the Application, you agree to be bound by these Terms. If you do not agree with any part of these Terms, you must not use the Application.

            <Typography variant='h6'> Use of the Application </Typography>
            <Typography variant='body2'>
              a. The Application allows users to create and manage their shopping lists. You may use the Application for personal, non-commercial purposes only.
            </Typography>
            <Typography variant='body2'>
              b. You are solely responsible for maintaining the confidentiality of your account information and ensuring the security of your login credentials.
            </Typography>
            <Typography variant='body2'>
              c. You agree not to use the Application for any illegal or unauthorized purpose. You must comply with all applicable laws and regulations while using the Application.
            </Typography>

            <Typography variant='h6'>User Content</Typography>
            <Typography variant='body2'>
              a. The Application allows you to input and store your shopping list data ("User Content"). You retain ownership of your User Content.
            </Typography>
            <Typography variant='body2'>
              b. By using the Application, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and display your User Content solely for the purpose of providing the Application's services.
            </Typography>
            <Typography variant='body2'>
              c. You are solely responsible for the accuracy, legality, and reliability of your User Content. You agree not to submit any infringing, defamatory, or unlawful content.
            </Typography>

            <Typography variant='h6'>Privacy</Typography>
            <Typography variant='body2'>
              a. We respect your privacy and handle your personal information in accordance with our Privacy Policy. By using the Application, you consent to the collection, use, and storage of your information as outlined in the Privacy Policy.
            </Typography>


            <Typography variant='h6'>Intellectual Property</Typography>
            <Typography variant='body2'>
              a. The Application and its contents, including but not limited to text, graphics, logos, and software, are owned by or licensed to us and are protected by intellectual property laws.
            </Typography>
            <Typography variant='body2'>
              b. You may not reproduce, distribute, modify, or create derivative works of any part of the Application without our prior written consent.
            </Typography>

            <Typography variant='h6'>Disclaimer of Warranties</Typography>
            <Typography variant='body2'>
              a. The Application is provided "as is" and without warranties of any kind, whether express or implied. We do not guarantee the accuracy, reliability, or availability of the Application.
            </Typography>
            <Typography variant='body2'>
              b. We disclaim any responsibility for any harm, loss, or damage resulting from your use of the Application.
            </Typography>

            <Typography variant='h6'>Limitation of Liability</Typography>
            <Typography variant='body2'>
              a. In no event shall we be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the Application.
            </Typography>
            <Typography variant='body2'>
              b. Our total liability, whether in contract, tort, or otherwise, shall not exceed the amount paid by you, if any, for accessing the Application.
            </Typography>

            <Typography variant='h6'>Modification of Terms</Typography>
            <Typography variant='body2'>
              a. We reserve the right to modify these Terms at any time. Updated Terms will be effective upon posting on the Application. It is your responsibility to review the Terms periodically.
            </Typography>
            <Typography variant='body2'>
              b. Your continued use of the Application after any modifications to the Terms constitutes your acceptance of the modified Terms.
            </Typography>

            <Typography variant='h6'>Termination</Typography>
            <Typography variant='body2'>
              a. We may terminate or suspend your access to the Application at any time without prior notice or liability for any reason, including violation of these Terms.
            </Typography>
            <Typography variant='body2'>
              b. Upon termination, your right to use the Application will immediately cease, and you must cease all use of the Application and delete any downloaded or saved copies.
            </Typography>

            <Typography variant='h6'>Governing Law and Jurisdiction</Typography>
            <Typography variant='body2'>
            a. These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction]. Any legal action or proceeding arising out of or relating to these Terms shall be exclusively brought in the courts of [Jurisdiction].
            </Typography>

            <Typography variant='h6'>Entire Agreement</Typography>
            <Typography variant='body2'>
              These Terms constitute the entire agreement between you and us regarding your use of the Application and supersede any prior agreements or understandings.
            </Typography>

            <Typography variant='body2'>
              Please read these Terms carefully before using the Application. If you have
            </Typography>
          </DialogContent>

          <DialogTitle variant='h5'>Privacy Policy</DialogTitle>
          <DialogContent>
            This Privacy Policy ("Policy") outlines how we collect, use, and disclose information in relation to the web application and services ("the Application") for tracking a user's shopping list. By using the Application, you consent to the practices described in this Policy.

            <Typography variant='h6'>Information Collection and Use</Typography>
            <Typography variant='body2'>
              a. Personal Information: We may collect personal information such as your name, email address, and login credentials. We store user credentials as securely hashed values to protect their confidentiality.
            </Typography>
            <Typography variant='body2'>
              b. User Lists: The Application allows you to create and manage your shopping lists. We collect and store the shopping list data ("User Lists") to provide the intended functionality of the Application.
            </Typography>
            <Typography variant='body2'>
              c. Usage Data: We may collect non-personal information, such as your IP address, browser type, and device information, to analyze usage patterns and improve the Application's performance.
            </Typography>

            <Typography variant='h6'>Information Sharing</Typography>
            <Typography variant='body2'>
              a. Sharing with Third Parties: We do not share your personal information or User Lists with third parties unless required by law or with your explicit consent.
            </Typography>
            <Typography variant='body2'>
              b. Service Providers: We may engage trusted third-party service providers to assist in operating and maintaining the Application. These providers are contractually bound to protect the confidentiality and security of your information.
            </Typography>

            <Typography variant='h6'>Data Retention</Typography>
            <Typography variant='body2'>
              a. We retain your personal information and User Lists for as long as necessary to fulfill the purposes outlined in this Policy or as required by law. If you delete your account, your personal information and User Lists will be permanently deleted from our active databases.
            </Typography>

            <Typography variant='h6'>Data Security</Typography>
            <Typography variant='body2'>
              a. We implement reasonable security measures to protect your information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet or electronic storage is entirely secure, and we cannot guarantee absolute security.
            </Typography>

            <Typography variant='h6'>User Choices and Rights</Typography>
            <Typography variant='body2'>
              a. Access and Update: You have the right to access and update your personal information stored in the Application. You can do so by accessing your account settings.
            </Typography>
            <Typography variant='body2'>
              b. Account Deletion: You may delete your account at any time, which will result in the permanent removal of your personal information and User Lists from our active databases.
            </Typography>
            <Typography variant='body2'>
              c. Opt-out: You have the right to opt-out of receiving promotional communications from us. You can unsubscribe by following the instructions provided in the communication or by contacting us directly.
            </Typography>

            <Typography variant='h6'>Children's Privacy</Typography>
            <Typography variant='body2'>
              a. The Application is not intended for use by individuals under the age of 13. We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child without parental consent, we will take steps to delete that information.
            </Typography>

            <Typography variant='h6'>Changes to this Policy</Typography>
            <Typography variant='body2'>
              a. We may update this Policy from time to time. We will notify you of any material changes by posting the updated Policy on the Application. Your continued use of the Application after the changes have been made constitutes your acceptance of the revised Policy.
            </Typography>

            <Typography variant='h6'>Contact Us</Typography>
            <Typography variant='body2'>
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at [TODO: RTL-24].
            </Typography>

            Please read this Privacy Policy carefully. By using the Application, you acknowledge and consent to the collection, use, and disclosure of your information as described in this Policy.
          </DialogContent>

          <DialogActions>
            <Button onClick={() => this.handleTOSAgreement(true)} autoFocus>Agree</Button>
            <Button onClick={() => this.handleTOSAgreement(false)}>Disagree</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default withNavigate(NewAccount);