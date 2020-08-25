import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";

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
};

class App extends React.Component<IProp, IState> {
  
  constructor(props: IProp) {
    super(props);

    // Initialize State
    this.state = {
      socket: null,
      itemList: [],
      redirect: null,
    };

    // Bind Member Functions
    this.submitItemAdd = this.submitItemAdd.bind(this);
  }

  componentDidMount() {
    // Connect Socket and Attach Listeners
    this.setState({ socket: io(`ws://${config.SERVER_IP}`) }, () => {
      const { socket } = this.state;

      // SOCKET CONNECT
      socket?.on('connect', () => {
        // Fetch List
        axios.get(`http://${config.SERVER_IP}/list`)
          .then(res => res.data)
          .then(data => this.setState({ itemList: data }))
          .catch(err => console.log(err));
      });

      // SOCKET: New Item Added
      socket?.on('new-item', (item: IItemData) => {
        const itemList = this.state.itemList;
        itemList.push(item);
        this.setState({ itemList });
      });
      
    });
  }

  private submitItemAdd(item: Partial<IItemData>) {
    // Emit to Socket to Add to DB
    this.state.socket?.emit('item-add', JSON.stringify(item));

    // Add to Client
    const itemList = this.state.itemList;
    itemList.push({ ...item, _id: String(itemList.length) } as any);

    // Go Home & Update Data
    this.setState({ redirect: '/', itemList, });
  }
  
  render() {
    const { itemList } = this.state;
    
    return (
      <div className="container">

        {/* ROUTER: Main Router */}
        <Router>
          {/* Programmable Redirect */}
          {this.state.redirect && <Redirect to={this.state.redirect} />}
          
          {/* SWITCH: Different Routes to Take */}
          <Switch>
            <Route exact path='/'>
              {/* DISPLAY: List of Data */}
              {itemList.map((val, index) =>
                <Item key={index} item={val} />
              )}

              {/* Add Button */}
              <div className='app-add-item-button'>
                <button onClick={() => this.setState({ redirect: '/add-item' })}>Add Item</button>
              </div>
            </Route>

            <Route path='/add-item'>
              <ItemInput onSubmit={this.submitItemAdd} />
            </Route>

          </Switch>

        </Router>

      </div>
    );
  }
  
}

export default App;
