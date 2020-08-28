// React Libraries
import React from 'react';
import { IItemData } from '.';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@material-ui/core';
import './style.css';

// Available Border Colors
const AVAIL_CLRS = [
  '#9b59b6', '#2ecc71', '#16a085', '#27ae60', 
  '#2980b9', '#8e44ad', '#2c3e50', '#e67e22',
  '#95a5a6', '#f39c12', '#0984e3', '#6c5ce7',
  '#e84393', '#e17055', '#00b894', '#74b9ff',
  '#2d3436',
];


interface IProp {
  onSubmit: (data: Partial<IItemData> | null) => void,
  item?: IItemData,       // Item Passed down
};
interface IState {
  itemName:     string,
  itemDesc:     string,
  itemQuantity: number,

  errorMessage: string | null,
};

class ItemInput extends React.Component<IProp, IState> {
  private nameInput: React.RefObject<HTMLInputElement>;
  private descInput: React.RefObject<HTMLInputElement>;
  private quantityInput: React.RefObject<HTMLInputElement>;

  constructor(props: IProp) {
    super(props);

    // Initial State
    this.state = {
      itemQuantity: -1,
      itemName: '',
      itemDesc: '',
      errorMessage: null,
    };
    
    // Create References
    this.nameInput = React.createRef();
    this.descInput = React.createRef();
    this.quantityInput = React.createRef();
    
    // Bind Member Functions
    this.onSubmit = this.onSubmit.bind(this);
  }

  // Update the State to match passed in Props
  componentDidMount() {
    const { item } = this.props;
    
    if(!item) return;
    this.setState({
      itemName: item.name,
      itemDesc: item.description || '',
      itemQuantity: item.count,
    });
  }

  private onSubmit(event: React.FormEvent | null) {
    // No Data Given (Exit)
    if (!event) return this.props.onSubmit(null);
    
    event.preventDefault();

    // Destructure Used Data
    const { itemDesc, itemName, itemQuantity } = this.state;

    // Assume all good
    this.descInput.current?.classList.remove('input-error');
    this.nameInput.current?.classList.remove('input-error');
    this.quantityInput.current?.classList.remove('input-error');
    this.setState({ errorMessage: null });
    
    // Validate Data input
    if(!itemName.length) {
      this.nameInput.current?.classList.add('input-error');
      this.nameInput.current?.focus();
      this.setState({ errorMessage: 'Enter Item Name!' });
      return;
    }
    
    if(!itemDesc.length) {
      this.descInput.current?.classList.add('input-error');
      this.descInput.current?.focus();
      this.setState({ errorMessage: 'Enter Item Description!' });
      return;
    }

    if(itemQuantity <= 0) {
      this.quantityInput.current?.classList.add('input-error');
      this.quantityInput.current?.focus();
      this.setState({ errorMessage: 'Enter Valid Quantity!' });
      return;
    }

    // Construct Final Result
    this.props.onSubmit({
      _id: this.props.item?._id,
      name: itemName,
      count: itemQuantity,
      color: AVAIL_CLRS[ Math.floor(Math.random() * AVAIL_CLRS.length) ],
      description: itemDesc,
    });
  }
  
  render() {
    const { itemDesc, itemQuantity, itemName } = this.state;
    const { item } = this.props;
    
    return (
      <div className='item-container'>

        {/* Div Padding */}
        <div className='form-item-padding' />
        
        <form name='add-item' onSubmit={this.onSubmit} className='form-item-container'>
          <input ref={this.nameInput} type="text" id="item-name" className='item-input' placeholder='Name'
            onChange={text => this.setState({ itemName: text.target.value })}
            value={itemName}
          />
          <textarea id="item-description" className='item-input' placeholder='Summary'
            onChange={text => this.setState({ itemDesc: text.target.value })}
            value={itemDesc}
          />

          <span className='item-info-mute' style={{ opacity: 1.0, marginTop: 2 }}>
            <strong><small>Item Count:</small></strong>
            <input ref={this.quantityInput} type="number" id="item-count" className='item-count'
              onChange={text => this.setState({ itemQuantity: Number(text.target.value) })}
              value={itemQuantity}
            />
          </span>

          <Button 
            variant='contained' 
            color='secondary' 
            type="submit"
            style={{ marginTop: 15 }}
            >{!item ? 'Submit' : 'Modify'}</Button>
          {this.state.errorMessage && <p className='input-error-text'>{this.state.errorMessage}</p>}
        </form>


        {/* Side Tab: Close */}
        <div className='form-item-padding' >
          <FontAwesomeIcon 
            style={{ fontSize: '1.5rem', cursor: 'pointer' }} 
            icon={faSignOutAlt} 
            onClick={() => this.onSubmit(null)} 
          />
        </div>
        
      </div>
    )
  }

}


export default ItemInput;