export default class FileModel {
    constructor(data) {
      this.id = data.id || null;
      this.propertyId = data.property_id || null;
      this.bookingId = data.booking_id || null;
      this.userId = data.user_id || null;
      this.fileData = data.fileData || null;
      this.filename = data.filename || null;
      this.filepath = data.filepath || null;
      this.filetype = data.filetype || null;
      this.createdAt = data.created_at || null;
      this.updatedAt = data.updated_at || null;
    }
  }