import React from 'react';
import './style.css';
import { IItemData } from '.';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faEdit } from '@fortawesome/free-solid-svg-icons';

interface IProp {
  item: IItemData;
  onDelete: (item: IItemData) => void;
  onModify: (item: IItemData) => void;
};
interface IState { };

class Item extends React.Component<IProp, IState> {

  render() {
    // Destructure Used Data
    const { image, color, count, name, description } = this.props.item;

    return (
      <div className="item-container" style={{ borderColor: color || 'black' }}>

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

        {/* RIGHT SIDE DATA */}
        <div style={{ display: 'flex' }}>
          {/* ITEM COUNT */}
          <div className="item-info-count">
            <span>{count}</span>
          </div>

          {/* ACTION: Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <FontAwesomeIcon style={{ cursor: 'pointer', fontSize: '1.2rem' }} icon={faTimesCircle} onClick={() => this.props.onDelete(this.props.item)} />
            <FontAwesomeIcon style={{ cursor: 'pointer', fontSize: '1.2rem' }} icon={faEdit} onClick={() => this.props.onModify(this.props.item)} />
          </div>
        </div>

      </div>
    );
  }
}

export default Item;