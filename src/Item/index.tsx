import Item from './Item';
import ItemInput from './ItemInput';

// Expected Item Data
export interface IItemData {
  _id:          string;     // MongoDB Hash ID
  image?:       string;     // Base64 Image
  count:        number;     // Quantity of Item
  name:         string;     // Item's Name
  description?: string;     // Item's Description Summary
}


export { 
  Item, 
  ItemInput
};