// User interface.
export interface IUserSchema {
  // Basic Information
  email:        string,
  password:     string,
}

// User Item Interface
export interface IItemSchema {
  // User Foreign key, associated with this item.
  userId:       IUserSchema,

  // Basic Information
  image?:       string;     // Base64 Image
  count:        number;     // Quantity of Item
  color:        string;     // Color Identifier for Item
  name:         string;     // Item's Name
  description:  string;     // Item's Description Summary

  // Removal Tracking
  deletedAt:    Date;       // Date of Removal
  isDeleted:    boolean;    // State of Removal
}
