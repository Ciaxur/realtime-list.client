import React from 'react';

// Component imports.
import {
  Item,
  IItemData,
} from '../Item';

interface IProp {
  socket: SocketIOClient.Socket | null;
  itemList: IItemData[] | null;
  isDarkMode: boolean;
};
interface IState {};

export default class Trash extends React.Component<IProp, IState> {
  constructor(props: IProp) {
    super(props);

    this.state = {};

    // Bind Member Functions
    this.deleteItem = this.deleteItem.bind(this);
    this.restoreItem = this.restoreItem.bind(this);
  }

  // SERVER: Remove Item Listing from Server (Fully Removes Item)
  private deleteItem(item: IItemData) {
    this.props.socket?.emit('item-del', item);
  }

  // SERVER: Restore Item from Server
  private restoreItem(item: Partial<IItemData>) {
    item.isDeleted = false;
    item.dateDeleted = undefined;
    this.props.socket?.emit('item-update', item);
  }

  render() {
    const { itemList, isDarkMode } = this.props;

    return (
      <>
        {/* DISPLAY: No List Data */}
        {itemList && !itemList.filter(val => val.isDeleted).length &&
          <strong>Nothing Trashed...</strong>
        }

        {/* DISPLAY: List of Trashed Data */}
        {itemList &&
          itemList
            .filter(val => val.isDeleted)
            .sort((a, b) => new Date(b.dateDeleted).getTime() - new Date(a.dateDeleted).getTime())
            .map((val, index) =>
              <Item
                key={index}
                item={val}
                onDelete={this.deleteItem}
                onRestore={this.restoreItem}
                darkMode={isDarkMode}
                showTrashDate={true}
              />,
        )}
      </>
    );
  }
}