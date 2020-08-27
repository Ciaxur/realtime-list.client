import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";

// Styling Libraries
import { Button } from '@material-ui/core';

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
  itemList: IItemData[];
  redirect: string | null;

  isItemEdit: boolean;        // State of Editing an Item
  item: IItemData | null;     // Item being Pointed to for Action
};

class App extends React.Component<IProp, IState> {
  constructor(props: IProp) {
    super(props);

    // Initialize State
    this.state = {
      socket: null,
      itemList: [],
      redirect: null,

      isItemEdit: false,
      item: null,
    };

    // Bind Member Functions
    this.submitItemAdd = this.submitItemAdd.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.updateItem = this.updateItem.bind(this);
    this.modifyItem = this.modifyItem.bind(this);
  }

  componentDidMount() {
    // Connect Socket and Attach Listeners
    this.setState({ socket: io(`wss://${config.SERVER_IP}`) }, () => {
      const { socket } = this.state;

      // SOCKET CONNECT
      socket?.on('connect', () => {
        // Fetch List
        axios.get(`https://${config.SERVER_IP}/list`)
          .then(res => res.data)
          .then(data => this.setState({ itemList: data }))
          .catch(err => {
            console.log('No List, ', err);
          });
      });

      // SOCKET: Error Messages
      socket?.on('error', (err: any) => {
        console.log('Socket Error Message:', err);
      });

      // SOCKET: New Item Added
      socket?.on('new-item', (item: IItemData) => {
        const itemList = this.state.itemList;
        itemList.push(item);
        this.setState({ itemList });
      });

      // SOCKET: Item Removed
      socket?.on('remove-item', (item: IItemData) => {
        const itemList = this.state.itemList.filter(val => val._id !== item._id);
        this.setState({ itemList });
      });

      // SOCKET: Item Updated
      socket?.on('update-item', (item: IItemData) => {
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

  // SERVER: Remove Item Listing from Server
  private deleteItem(item: IItemData) {
    this.state.socket?.emit('item-del', item);
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
  
  render() {
    const { itemList, item } = this.state;
    
    return (
      <div className="container">

        {/* ROUTER: Main Router */}
        <Router>
          {/* Programmable Redirect */}
          {this.state.redirect && <Redirect to={this.state.redirect} />}
          
          {/* SWITCH: Different Routes to Take */}
          <Switch>
            <Route exact path='/'>
              {/* DISPLAY: No List Data */}
              {!itemList.length && 
                <h3 style={{ color: '#d35400' }}>No Items...</h3>
              }
              
              {/* DISPLAY: List of Data */}
              {itemList.map((val, index) =>
                <Item 
                  key={index} 
                  item={val} 
                  onDelete={this.deleteItem}
                  onModify={this.modifyItem}
                />
              )}

              {/* Add Button */}
              <div className='app-add-item-button'>
                <Button 
                  variant='contained'
                  color='primary'
                  onClick={() => this.setState({ redirect: '/add-item' })}>Add Item</Button>
              </div>
            </Route>

            <Route path='/add-item'>
              <ItemInput onSubmit={this.submitItemAdd} />
            </Route>

            <Route path='/edit-item'>
              { item && item._id
                ? <ItemInput item={item} onSubmit={this.updateItem} />
                : <h3>No Item Selected to Edit</h3>
              }
            </Route>

          </Switch>

        </Router>

      </div>
    );
  }
  
}

export default App;
