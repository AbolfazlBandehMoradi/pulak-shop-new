export interface MediaFile {
  id?: number;
  filePath?: string;
  thumbnailPath?: string;
  alt?: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productVariantId?: number;
  itemName: string;
  sku: string;
  unitPrice: number;
  taxRate: number;
  quantity: number;
  total: number;
  metadataJson?: string;
  productImage?: MediaFile;
  productSlug?: string;
}

export interface DeliveryMethodFieldDefinition {
  key: string;
  fieldType?: string;
  label?: Record<string, string>;
}

export interface OrderDeliveryDetail {
  deliveryMethodId: number;
  baseCost?: number;
  methodName: string;
  localizedMethodName?: Record<string, string>;
  icon?: string;
  fieldDefinitions: DeliveryMethodFieldDefinition[];
  fieldValues: Record<string, string>;
}

export interface OrderShippingAddress {
  title?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  alternativePhone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  additionalDetails?: string;
  latitude?: number;
  longitude?: number;
}

export interface OrderDetail {
  id: number;
  orderNumber: string;
  userId?: number;
  userName?: string;
  userEmail?: string;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  currencyCode: string;
  currencySymbol: string;
  exchangeRate: number;
  shippingAddressJson?: string;
  billingAddressJson?: string;
  shippingAddress?: OrderShippingAddress | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  notes?: string;
  paymentAuthority?: string;
  transactionReferenceId?: string;
  paidAt?: string;
  paymentAmountVerified?: number;
  paymentCardNumber?: string;
  paymentGatewayStatus?: number;
  paymentGatewayOrderId?: string;
  paymentDetailsJson?: string;
  items: OrderItem[];
  delivery?: OrderDeliveryDetail | null;
}
