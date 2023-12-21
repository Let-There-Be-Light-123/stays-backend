export default class JsonDataProvider {
  static callMockApiCall = () => {
    return {
      rooms : [
        { id: 1, name: "Room A", bookings: [101, 102] },
        { id: 2, name: "Room B", bookings: [103, 104, 105] },
        // Add more rooms as needed
      ],
      bookings:[
        { id: 101, roomId: 1, from: "2023-01-01T08:00:00", to: "2023-01-01T12:00:00" },
        { id: 102, roomId: 1, from: "2023-01-02T10:00:00", to: "2023-01-02T14:00:00" },
        { id: 103, roomId: 2, from: "2023-01-03T08:00:00", to: "2023-01-03T12:00:00" },
        { id: 104, roomId: 2, from: "2023-01-04T10:00:00", to: "2023-01-04T14:00:00" },
        { id: 105, roomId: 2, from: "2023-01-05T08:00:00", to: "2023-01-05T12:00:00" },
      ]
    };
  };
}
