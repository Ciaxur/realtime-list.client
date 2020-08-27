// React Libraries
import React from 'react';
import { IItemData } from '.';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'



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

    // Focus on the Name Input
    console.log(this.nameInput);
    this.nameInput.current?.focus();
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
      description: itemDesc,
    });
  }
  
  render() {
    const { itemDesc, itemQuantity, itemName } = this.state;
    
    return (
      <div className='item-container'>

        {/* Div Padding */}
        <div style={{ width: 100 }} />
        
        <form name='add-item' onSubmit={this.onSubmit} className='form-item-container'>
          <input ref={this.nameInput} type="text" id="item-name" className='item-input' placeholder='Name'
            onChange={text => this.setState({ itemName: text.target.value })}
            value={itemName}
          />
          <input ref={this.descInput} type="text" id="item-description" className='item-input' placeholder='Summary'
            onChange={text => this.setState({ itemDesc: text.target.value })}
            value={itemDesc}
          />

          <span className='item-info-mute' style={{ color: 'white', marginTop: 2 }}>
            Item Count:
            <input ref={this.quantityInput} type="number" id="item-count" className='item-count'
              onChange={text => this.setState({ itemQuantity: Number(text.target.value) })}
              value={itemQuantity}
            />
          </span>

          <button type="submit" className="item-input-button">Submit</button>
          {this.state.errorMessage && <p className='input-error-text'>{this.state.errorMessage}</p>}
        </form>


        {/* Side Tab: Close */}
        <div style={{ width: 100 }}>
          <FontAwesomeIcon 
            style={{ fontSize: '2rem', cursor: 'pointer' }} 
            icon={faSignOutAlt} 
            onClick={() => this.onSubmit(null)} 
          />
        </div>
        
      </div>
    )
  }

}


export default ItemInput;