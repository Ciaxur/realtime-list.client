import Item from './Item';
import ItemInput from './ItemInput';

// Expected Item Data
export interface IItemData {
  _id:          String;     // MongoDB Hash ID
  image?:       String;     // Base64 Image
  count:        Number;     // Quantity of Item
  name:         String;     // Item's Name
  description?: String;     // Item's Description Summary
}


export { 
  Item, 
  ItemInput
};