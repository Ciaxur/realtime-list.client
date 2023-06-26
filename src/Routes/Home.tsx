import React from 'react';
import ReactLoading from 'react-loading';

// Styling Libraries
import { Button } from '@material-ui/core';
import {
  Link,
  NavigateFunction,
} from 'react-router-dom';

// Component imports.
import {
  Item,
  IItemData,
} from '../Item';
import { withNavigate } from '../HOC/Navigation';

interface IProp {
  socket:         SocketIOClient.Socket | null;
  itemList:       IItemData[] | null;
  isDarkMode:     boolean;
  navigate?:      NavigateFunction;

  // Callbacks.
  onItemSelected: (item: IItemData) => void;
};
interface IState {};

class Home extends React.Component<IProp, IState> {
  constructor(props: IProp) {
    super(props);

    this.state = {};

    // Bind Member Functions
    this.trashItem = this.trashItem.bind(this);
    this.editItem = this.editItem.bind(this);
  }

  // SERVER: Trash Item Listing from Server
  private trashItem(item: IItemData) {
    item.isDeleted = true;
    item.dateDeleted = new Date(Date.now());
    this.props.socket?.emit('item-update', item);
  }

  // Selects an item to modify.
  private editItem(item: IItemData) {
    this.props.onItemSelected(item);
    if (this.props.navigate)
      this.props.navigate('/edit-item');
  }

  render() {
    const {
      itemList,
      isDarkMode,
    } = this.props;

    return (
      <>
        {/* LOADING DATA */}
        {itemList === null &&
          <>
            <h4 style={{ marginBottom: 10 }}>Loading Data...</h4>
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
            onModify={this.editItem}
            darkMode={isDarkMode}
          />,
        )}

        {/* Add Button */}
        {itemList !== null &&
          <div className='app-add-item-button'>
            <Link to='/add-item'>
              <Button variant='contained' color='primary'>Add Item</Button>
            </Link>
          </div>
        }
      </>
    );
  }
}

export default withNavigate(Home);