import moment from "moment";

export default class DataConvertHelper {
  static convertRoomsToTimelineGroups(rooms) {
    return rooms.map((room, index) => ({
      id: index + 1,
      title: room.name,
    }));
  }

  static convertBookingsToTimelineItems(bookings, rooms) {
    const hash = this._mapRoomIdsToBookingIds(rooms);

    return bookings.map((booking) => ({
      id: booking.id,
      group: hash[booking.roomId],
      title: booking.id,
      start_time: moment(booking.from),
      end_time: moment(booking.to),
    }));
  }
  static _mapRoomIdsToBookingIds(rooms) {
    const hash = {};
    rooms.forEach((room, index) => {
      console.log('Current Room:', room);
      if (room && room.assignedBookingId) {
        console.log('Assigned Order IDs:', room.assignedBookingId);
        room.assignedBookingId.forEach((id) => {
          hash[id] = index + 1;
        });
      }
    });
    console.log('Final Hash:', hash);
    return hash;
  }
}