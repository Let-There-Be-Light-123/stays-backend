import React, { forwardRef } from 'react';
import './styles.css';
import Config from "../../config/config.js";

const BookingVoucher = forwardRef((props, ref) => {
  const { bookingDetails } = props;
  const options = { day: 'numeric', month: 'short', year: 'numeric' };

  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date(dateString).toLocaleDateString(undefined, options);
    return formattedDate;
  }

  function calculateNumberOfDays(checkInDate, checkOutDate) {
    const timeDifference = checkOutDate.getTime() - checkInDate.getTime();
    const numberOfDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    return numberOfDays;
  }

  return (
    <div ref={ref} className="booking-voucher">
      <div className="header">
        <div className="header-inner">
          <div className='title'>
            <img className="title-image" src={`${Config.BASE_URL}/storage/public/uploads/default/logo.png`} />
            <div className="title-text" >BOOKING <br /> VOUCHER</div>
          </div>
          <div className="logo">
            <img className='logo-image' src={`${Config.BASE_URL}/storage/public/uploads/default/Shelter_Solutions_Logo.png`} alt="Shelter Solution 360" />
          </div>
        </div>
      </div>
      <div className="content">
        {bookingDetails && (
          <div className="booking-details" style={{ display: 'flex' }}>
            <div className='booking-reference' style={{ width: '50%' }}>
              <div className="booking-id">Booking ID: <br /> {bookingDetails.bookingReference}</div>
              <div className='booking-date'>Booking Date: {bookingDetails.updatedAt}</div>
              <div >Check in Time: 14:00</div>
              <div >Check out Time: 10:00</div>
            </div>
            <div className='hotel-details' style={{ width: '50%' }}>
              <div className="hotel-name">Hotel Name: {bookingDetails.property && bookingDetails.property[0]?.property_name}</div>
              <div className="booking-date">Booking Date: {bookingDetails.updatedAt}</div>
              <div className="address">{bookingDetails.property && bookingDetails.property[0]?.address}</div>
              <div className="timings" style={{ display: 'flex' }}>
                <div className="check-in" >
                  Check-in:
                  <br />
                  {formatDate(bookingDetails.checkInDate)}
                </div>
                <div className="check-out">
                  Check-out:
                  <br />
                  {formatDate(bookingDetails.checkOutDate)}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="horizontal-divider" style={{ borderBottom: '1px solid #ddd', marginBottom: '20px' }}></div>
        {bookingDetails && (
          <div className="content-inner" style={{ display: 'flex' }}>
            <div className='property-image' style={{ width: '40%' }}>
              {bookingDetails.property && bookingDetails.property[0]?.files && bookingDetails.property[0]?.files[0] && (
                <img
                  className='property-image-inner'
                  src={`${Config.BASE_URL}/storage/public/uploads/properties/${bookingDetails.property[0]?.property_id}/${bookingDetails.property[0]?.files[0]?.filename}`}
                  alt="Property"
                />
              )}
            </div>
            <div className="guest-details">
              <div className="booking-details-title">Booking Details</div>
              <div className="horizontal-divider" style={{ borderBottom: '1px solid #ddd', marginBottom: '20px' }}></div>
              {bookingDetails.bookedBy && (
                <>
                  <div className="main-guest">Main Guest: {bookingDetails.bookedBy.name}</div>
                  <div className="social-security">Social Security Number: {bookingDetails.bookedBy.socialSecurity}</div>
                </>
              )}
              <div className="room-id">Room ID: {bookingDetails.roomName}</div>
              <div className="total-guests">Total Guests: {bookingDetails.guests ? (bookingDetails.guests.length === 0 ? 1 : bookingDetails.guests.length) : 0}</div>
              <div className="total-nights">Total Nights: {calculateNumberOfDays(bookingDetails.checkInDate, bookingDetails.checkOutDate)}</div>
              <div className="meal-included">Meal Included: Yes</div>
            </div>
          </div>
        )}
        <div className='content-signature' style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          {bookingDetails && bookingDetails.bookedBy && (
            <img className="signature" src={`${Config.BASE_URL}/storage/public/uploads/signatures/${bookingDetails.bookingReference}/${bookingDetails.signatures[0]?.signature}`} alt="Signature" />
          )}
          <div className='signature-text'>Signature</div>
        </div>
      </div>
      <div className="footer">
        <div className="company-info">
          <div className='vertical-break-footer'></div>
          <div className='company-info-inner'>
            SHELTER SOLUTION 360
            <br />
            hello@reallygreatsite.com
            <br />
            123 Anywhere St., Any City, ST 12345
            <br />
            +123 456 7890
          </div>
        </div>
        <div className="approval"><img className="approval-image" src={`${Config.BASE_URL}/storage/public/uploads/default/approved.jpeg`} alt="APPROVED" /></div>
      </div>
    </div>
  )
});

export default BookingVoucher;