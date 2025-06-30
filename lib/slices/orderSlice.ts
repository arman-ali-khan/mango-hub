import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  packageType: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: string;
  transactionId: string;
  status: 'pending' | 'verified' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.push(action.payload);
      state.currentOrder = action.payload;
    },
    updateOrderStatus: (state, action: PayloadAction<{ id: string; status: Order['status'] }>) => {
      const order = state.orders.find(order => order.id === action.payload.id);
      if (order) {
        order.status = action.payload.status;
      }
    },
    updateOrderInState: (state, action: PayloadAction<{ 
      id: string; 
      updates: Partial<Pick<Order, 'transactionId' | 'paymentMethod' | 'status'>>
    }>) => {
      const order = state.orders.find(order => order.id === action.payload.id);
      if (order) {
        Object.assign(order, action.payload.updates);
      }
      // Also update currentOrder if it matches
      if (state.currentOrder && state.currentOrder.id === action.payload.id) {
        Object.assign(state.currentOrder, action.payload.updates);
      }
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { 
  setOrders, 
  addOrder, 
  updateOrderStatus, 
  updateOrderInState,
  setCurrentOrder, 
  setLoading 
} = orderSlice.actions;
export default orderSlice.reducer;