import React from 'react';
import './App.scss';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link,
} from "react-router-dom";
import ReactLoading from 'react-loading';

// Components
import Authorzation from './Components/Authorization';

// Styling Libraries
import { Button } from '@material-ui/core';
import MaterialSwitch from '@material-ui/core/Switch'

// Axios & Socket Library
import io from 'socket.io-client';
import axios from 'axios';

// Component Imports
import {
  ItemInput,
  Item,
  IItemData,
} from './Item';

// Import Configuration
import config from './config';


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
    this.deleteItem = this.deleteItem.bind(this);
    this.trashItem = this.trashItem.bind(this);
    this.updateItem = this.updateItem.bind(this);
    this.modifyItem = this.modifyItem.bind(this);
    this.restoreItem = this.restoreItem.bind(this);
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

      // SOCKET: Authorization Ack
      socket?.on('authorized', () => this.setState({ authorized: true }));

      // SOCKET: Error Messages
      socket?.on('error', (err: any) => {
        console.log('Socket Error Message:', err);
        
        // Attempted to authorize and failed
        this.setState({ authorizeLoad: true, redirect: '/login' });
      });

      // SOCKET: New Item Added
      socket?.on('new-item', (item: IItemData) => {
        if(!this.state.itemList) return;
        
        const itemList = this.state.itemList;
        itemList.push(item);
        this.setState({ itemList });
      });

      // SOCKET: Item Removed
      socket?.on('remove-item', (item: IItemData) => {
        if(!this.state.itemList) return;
        
        const itemList = this.state.itemList.filter(val => val._id !== item._id);
        this.setState({ itemList });
      });

      // SOCKET: Item Updated
      socket?.on('update-item', (item: IItemData) => {
        if(!this.state.itemList) return;

        // Update the new Item
        const itemList = this.state.itemList
          .map(val => val._id === item._id ? item : val);
        this.setState({ itemList });
      })
      
    });
  }

  // SERVER: Submit Item Listing to Server
  private submitItemAdd(item: Partial<IItemData> | null) {
    // Added Item
    if(item) {
      // Emit to Socket to Add to DB
      this.state.socket?.emit('item-add', item);
    }

    // Go Home & Update Data
    this.setState({ redirect: '/' });
  }

  // SERVER: Remove Item Listing from Server (Fully Removes Item)
  private deleteItem(item: IItemData) {
    this.state.socket?.emit('item-del', item);
  }

  // SERVER: Trash Item Listing from Server
  private trashItem(item: IItemData) {
    item.isDeleted = true;
    item.dateDeleted = new Date(Date.now());
    this.state.socket?.emit('item-update', item);
  }

  // SERVER: Restore Item from Server
  private restoreItem(item: Partial<IItemData>) {
    item.isDeleted = false;
    item.dateDeleted = undefined;
    this.state.socket?.emit('item-update', item);
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


  // Sets up Modifying an Item
  private modifyItem(item: IItemData) {
    // Setup the State for Editing the Item
    this.setState({
      item,
      isItemEdit: true,
      redirect: '/edit-item',
    });
  }

  // Toggles Dark Mode Theme
  private toggleDarkMode(state: boolean) {
    // Save Dark Mode in a Cookie
    const expiration = new Date( Date.now() + 1 * 24 * 60 * 60 * 1000 );
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
          
          {/* Programmable Redirect */}
          {this.state.redirect && <Redirect to={this.state.redirect} />}
          
          {/* SWITCH: Different Routes to Take */}
          <Switch>
            <Route exact path='/'>
              {/* LOADING DATA */}
              {itemList === null && 
                <>
                  <h4 style={{marginBottom: 10}}>Loading Data...</h4>
                  <ReactLoading 
                    type={'spinningBubbles'} 
                    color={'#2c3e50'} 
                    width={40} 
                    height={40} />
                </>
              }
              
              {/* DISPLAY: No List Data */}
              {itemList && !itemList.filter(item => !item.isDeleted).length && 
                <strong>No Items...</strong>
              }
              
              {/* DISPLAY: List of Data */}
              {itemList && itemList.filter(val => !val.isDeleted).map((val, index) =>
                <Item
                  key={index}
                  item={val}
                  onTrash={this.trashItem}
                  onModify={this.modifyItem}
                  darkMode={isDarkMode}
                />
              )}

              {/* Add Button */}
              {itemList !== null &&
                <div className='app-add-item-button'>
                  <Button 
                    variant='contained'
                    color='primary'
                    onClick={() => this.setState({ redirect: '/add-item' })}>Add Item</Button>
                </div>
              }
            </Route>
            
            <Route path='/add-item'>
              <ItemInput darkMode={isDarkMode} onSubmit={this.submitItemAdd} />
            </Route>

            <Route path='/edit-item'>
              { item && item._id
                ? <ItemInput darkMode={isDarkMode} item={item} onSubmit={this.updateItem} />
                : <h3>No Item Selected to Edit</h3>
              }
            </Route>

            <Route path='/trash'>

              {/* DISPLAY: No List Data */}
              {itemList && !itemList.filter(val => val.isDeleted).length && 
                <strong>Nothing Trashed...</strong>
              }
              
              {/* DISPLAY: List of Trashed Data */}
              {itemList &&
                itemList
                  .filter(val => val.isDeleted)
                  .sort((a, b) => Number(a.dateDeleted) - Number(b.dateDeleted))
                  .map((val, index) =>
                    <Item
                      key={index}
                      item={val}
                      onDelete={this.deleteItem}
                      onRestore={this.restoreItem}
                      darkMode={isDarkMode}
                      showTrashDate={true}
                    />
                  )}
              
            </Route>

            <Route path='/changes'>
              {/* Generated using markdown Text to HTML on CHANGELOG.md */}
              <div className='app-changelog'>

                <strong>Version 1.1.0 (User Features)</strong>
                <ul>
                  <li>[x] Dark Mode</li>
                  <li>[x] Cookies</li>
                  <li>[x] Trash (Recently Deleted Items, sort by Date)</li>
                  <li>[x] Loading Indicator</li>
                  <li>[x] Routes
                    <ul>
                      <li>Home | Changelog | About</li>
                      <li>Add robots.txt</li>
                    </ul>
                  </li>
                </ul>

                <strong>Version 1.0.0 (Base Features)</strong>
                <ul>
                  <li>[x] Start the Project <span aria-label='rocket' role='img'>🚀</span></li>
                  <li>[x] Add <code>material-ui</code></li>
                  <li>[x] Add Server Link to the README.md File, likewise other way</li>
                  <li>[x] Better Colors and Styles <strong>UX</strong>

                    <ul>
                      <li>Random Color Borders (<em>Store on Server per Creation</em>)</li>
                    </ul>
                  </li>
                  <li>[x] <span aria-label='bug' role='img'>🐞</span> Fix <strong>Add Item</strong> Overlapping and not Staying on very Bottom</li>
                </ul>

              </div>

            </Route>

            <Route path='/about'>

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
                    onChange={state => this.toggleDarkMode(state.currentTarget.checked)} />
                </small>
              </div>

              
            </Route>

            <Route path='/login'>
              {
                authorized
                  ? <h3>Already logged in!</h3>
                  : <Authorzation onSuccess={() => this.onAuthorized()} />
              }
            </Route>
          </Switch>

        </Router>

      </div>
    );
  }
  
}

export default App;
