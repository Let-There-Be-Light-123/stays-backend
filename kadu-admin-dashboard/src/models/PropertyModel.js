import FileModel from "./FileModel";
export default class PropertyModel {
  constructor(data) {
    this.id = data.property_id || null;
    this.title = data.property_name || null;
    this.category = data.property_type || null;
    this.isActive = data.is_active || null;
    this.isFeatured = data.is_featured || null;
    this.isMostLiked = data.is_most_liked || null;
    this.likes = data.likes || null;
    this.onHomepage = data.on_homepage || null;
    this.description = data.property_description || null;
    this.contact = data.contact || null;
    this.lat = data.lat || null;
    this.lng = data.lng || null;
    this.address = data.address || null;
    this.addressId = data.address_id || null;
    this.createdAt = data.created_at || null;
    this.updatedAt = data.updated_at || null;
    this.rooms = (data.rooms || []).map(room => ({
      roomId: room.room_id || null,
      propertyId: room.property_id || null,
      roomName: room.room_name || null,
      isActive: room.is_active || null,
      roomDescription: room.room_description || null,
      createdAt: room.created_at || null,
      updatedAt: room.updated_at || null,
    }));
    this.files = (data.files || []).map(file => new FileModel(file));
    this.updatedFiles;
  }
}