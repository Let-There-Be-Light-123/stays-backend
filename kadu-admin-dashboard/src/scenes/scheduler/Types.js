// Truck type
export const Room = {
  name: '',
  assignedBookingId: [],
};

export const Booking = {
  id: '',
  from: '',
  to: '',
};

export const APIData = {
  rooms: [],
  bookings: [],
};

// MockAPIComponent interface
export const MockAPIComponent = {
  getData: () => Promise.resolve(),
};
