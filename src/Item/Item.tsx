import React from 'react';
import './style.css';
import { IItemData } from '.';

interface IProp {
  item: IItemData;
};
interface IState { };

class Item extends React.Component<IProp, IState> {
  
  render() {
    // Destructure Used Data
    const { image, count, name, description } = this.props.item;

    return (
      <div className="item-container">

      {/* ITEM INFO */}
      <div className="item-info-container">
        {image && 
          <img src={image as any} alt='item-avatar' />
        }

        <div className="item-info">
          <h4>{name}</h4>
          <p className="item-info-mute">{description}</p>
        </div>
        
      </div>

      {/* ITEM COUNT */}
      <div>
        <span className="item-info-count">{count}</span>
      </div>
        
      </div>
    );
  }
}

export default Item;