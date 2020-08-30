import React from 'react';
import './style.css';
import { IItemData } from '.';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimesCircle,
  faEdit,
  faTrashAlt,
  faUndo,
} from '@fortawesome/free-solid-svg-icons';

interface IProp {
  item:       IItemData;
  darkMode?:  boolean;
  onDelete?:  (item: IItemData) => void;
  onTrash?:   (item: IItemData) => void;
  onModify?:  (item: IItemData) => void;
  onRestore?: (item: IItemData) => void;
};
interface IState { };

class Item extends React.Component<IProp, IState> {

  render() {
    // Destructure Used Data
    const { image, color, count, name, description } = this.props.item;
    const { onModify, onDelete, onRestore, onTrash, darkMode } = this.props;


    return (
      <div className="item-container" style={{ borderColor: color || 'black' }}>

        {/* ITEM INFO */}
        <div className="item-info-container">
          {image &&
            <img src={image as any} alt='item-avatar' />
          }

          <div className="item-info">
            <h4>{name}</h4>
            <p className={`item-info-mute ${darkMode && 'dark-mode-mute'}`}>{description}</p>
          </div>

        </div>

        {/* RIGHT SIDE DATA */}
        <div style={{ display: 'flex' }}>
          {/* ITEM COUNT */}
          <div className='item-info-count'>
            <span className={darkMode ? 'dark-mode-mute' : ''}>{count}</span>
          </div>

          {/* ACTION: Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {(onTrash !== undefined || onDelete !== undefined) &&
              <FontAwesomeIcon
                style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                icon={onTrash ? faTrashAlt : faTimesCircle}
                color={onTrash ? undefined : '#e74c3c'}
                onClick={() => ((onTrash ? onTrash : onDelete) as any)(this.props.item)}
              />
            }

            {/* Modify Only if Available */}
            {onModify &&
              <FontAwesomeIcon
                style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                icon={faEdit}
                onClick={() => onModify && onModify(this.props.item)}
              />
            }

            {/* Restore Item */}
            {onRestore &&
              <FontAwesomeIcon
                style={{ cursor: 'pointer', fontSize: '1.1rem', marginTop: 10 }}
                icon={faUndo}
                onClick={() => onRestore && onRestore(this.props.item)}
              />
            }
          </div>
        </div>

      </div>
    );
  }
}

export default Item;