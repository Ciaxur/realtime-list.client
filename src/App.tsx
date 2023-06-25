import React from 'react';
import './App.scss';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
} from 'react-router-dom';

// Components
import Authorzation from './Components/Authorization';


// Axios & Socket Library
import io from 'socket.io-client';
import axios from 'axios';

// Component Imports
import {
  ItemInput,
  IItemData,
} from './Item';

// Import Configuration
import config from './config';

// Routes
import { Home } from './Routes/Home';
import { Trash } from './Routes/Trash';
import { ChangeLog } from './Routes/Changelog';
import { About } from './Routes/About';


interface IProp {};
interface IState {
  socket: SocketIOClient.Socket | null;
  itemList: IItemData[] | null;
  redirect: string | null;

  isItemEdit: boolean;        // State of Editing an Item
  item: IItemData | null;     // Item being Pointed to for Action
  isDarkMode: boolean;        // Dark Mode State

  authorized: boolean,        // State of Authorization
  authorizeLoad: boolean,     // State of trying to authorize
};

class App extends React.Component<IProp, IState> {
  constructor(props: IProp) {
    super(props);

    // Initialize State
    this.state = {
      socket: null,
      itemList: null,
      redirect: null,

      isItemEdit: false,
      item: null,
      isDarkMode: false,

      authorized: false,
      authorizeLoad: false,
    };

    // Bind Member Functions
    this.submitItemAdd = this.submitItemAdd.bind(this);
    this.updateItem = this.updateItem.bind(this);
    this.toggleDarkMode = this.toggleDarkMode.bind(this);
  }

  componentDidMount() {
    // Read in Cookies
    const cookies = document.cookie.split('=');
    cookies.forEach((val, index) => {
      if (val === 'darkMode' && cookies[index + 1] !== undefined) {
        this.setState({ isDarkMode: cookies[index + 1] === 'true' ? true : false });
      }
    });

    this.triggerSocketConnect();
  }

  private triggerSocketConnect() {
    // Early return if already connected
    if (this.state.socket) return;

    // Secure Request?
    const secure = process.env.REACT_APP_UNSECURE ? false : true; // Defaulted to True

    // Connect Socket and Attach Listeners
    this.setState({ socket: io(`ws${secure ? 's' : ''}://${config.SERVER_IP}`) }, () => {
      const { socket } = this.state;

      // SOCKET CONNECT
      socket?.on('connect', () => {
        // Fetch List
        axios.get(`http${secure ? 's' : ''}://${config.SERVER_IP}/v1/items/list`, { withCredentials: true })
          .then(res => res.data)
          .then(data => this.setState({ itemList: data }))
          .catch(err => {
            this.setState({ itemList: [] });
            console.log('No List, ', err);
          });
        this.setState({ authorizeLoad: true, redirect: '/' });
      });

      // SOCKET DISCONNECT
      socket?.on('disconnect', () => {
        this.setState({ socket: null });
      });

      // SOCKET: Authorization Ack
      socket?.on('authorized', () => this.setState({ authorized: true }));

      // SOCKET: Error Messages
      socket?.on('error', (err: Error) => {
        console.log('Socket Error Message:', err);

        // Attempted to authorize and failed
        this.setState({ authorizeLoad: true, redirect: '/login', socket: null });
      });

      // SOCKET: New Item Added
      socket?.on('new-item', (item: IItemData) => {
        if (!this.state.itemList) return;

        const itemList = this.state.itemList;
        itemList.push(item);
        this.setState({ itemList });
      });

      // SOCKET: Item Removed
      socket?.on('remove-item', (item: IItemData) => {
        if (!this.state.itemList) return;

        const itemList = this.state.itemList.filter(val => val._id !== item._id);
        this.setState({ itemList });
      });

      // SOCKET: Item Updated
      socket?.on('update-item', (item: IItemData) => {
        if (!this.state.itemList) return;

        // Update the new Item
        const itemList = this.state.itemList
          .map(val => val._id === item._id ? item : val);
        this.setState({ itemList });
      });
    });
  }

  // SERVER: Submit Item Listing to Server
  private submitItemAdd(item: Partial<IItemData> | null) {
    // Added Item
    if (item) {
      // Emit to Socket to Add to DB
      this.state.socket?.emit('item-add', item);
    }

    // Go Home & Update Data
    this.setState({ redirect: '/' });
  }


  // SERVER: Update Item Listing on Server
  private updateItem(item: Partial<IItemData> | null) {
    // Issue an Update to Server
    this.state.socket?.emit('item-update', item);

    // Redirect back to Home & Modify State
    this.setState({
      item: null,
      isItemEdit: false,
      redirect: '/',
    });
  }

  // Toggles Dark Mode Theme
  private toggleDarkMode(state: boolean) {
    // Save Dark Mode in a Cookie
    const expiration = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
    document.cookie = `darkMode=${state}; expires=${expiration.toUTCString()}; path=/`;

    this.setState({ isDarkMode: state });
  }

  // Authorization Callback
  private onAuthorized() {
    this.setState({ authorized: true, redirect: '/' }, this.triggerSocketConnect);
  }

  render() {
    const { itemList, item, isDarkMode, authorized } = this.state;

    return (
      <div className='container' style={isDarkMode ? { backgroundColor: '#2c3e50', color: '#ecf0f1' } : {}}>

        {/* ROUTER: Main Router */}
        <Router>
          {/* HEADER: Links */}
          <div className='app-header'>

            <Link to='/' onClick={() => this.setState({ redirect: '/' })}>Home</Link>
            <Link to='/trash'>Trash</Link>
            <Link to='/about'>About</Link>
            {!authorized && (
              <Link to='/login'>Login</Link>
            )}

          </div>

          {/* Routes: Different Routes to Take */}
          <Routes>

          <Route path='/' element={
              <Home
                itemList={itemList}
                socket={this.state.socket}
                isDarkMode={isDarkMode}
              />
            }/>

            <Route path='/add-item' element={
              <ItemInput darkMode={isDarkMode} onSubmit={this.submitItemAdd} />
            }/>

            <Route path='/edit-item' element={
              <>
                {item && item._id
                  ? <ItemInput darkMode={isDarkMode} item={item} onSubmit={this.updateItem} />
                  : <h3>No Item Selected to Edit</h3>
                }
              </>
            }/>

            <Route path='/trash' element={
              <Trash
                itemList={itemList}
                socket={this.state.socket}
                isDarkMode={isDarkMode}
              />
            }/>

            <Route path='/changes' element={<ChangeLog/>}/>

            <Route path='/about' element={<About isDarkMode={isDarkMode} toggleDarkMode={state => this.toggleDarkMode(state)} />}/>

            <Route path='/login' element={
              <>
                {
                  authorized
                    ? <h3>Already logged in!</h3>
                    : <Authorzation onSuccess={() => this.onAuthorized()} />
                }
              </>
            }/>
          </Routes>
        </Router>

      </div>
    );
  }
}

export default App;
