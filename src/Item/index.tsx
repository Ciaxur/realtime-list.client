import Item from './Item';
import ItemInput from './ItemInput';

// Expected Item Data
export interface IItemData {
  _id:          string;     // MongoDB Hash ID

  // Basic Information
  image?:       string;     // Base64 Image
  count:        number;     // Quantity of Item
  color:        string;     // Randomly Assigned Color
  name:         string;     // Item's Name
  description?: string;     // Item's Description Summary

  // Removal Tracking
  dateDeleted:  Date;       // Date of Removal
  isDeleted:    boolean;    // State of Removal
}


export { 
  Item, 
  ItemInput,
};