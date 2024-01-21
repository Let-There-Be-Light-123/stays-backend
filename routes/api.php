<?php

use App\Http\Controllers\EmailController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\CheckAvailabilityController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\AdminLogsController;
use App\Http\Controllers\UserReviewController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\SignatureController;
use App\Http\Controllers\NotificationController;


Route::post('register', [UserController::class, 'register']); //completed
Route::post('login', [UserController::class, 'loginUser']); //completed
Route::get('/users', [UserController::class, 'getAllUsers']);//completed
Route::put('/users/{social_security}', [UserController::class, 'updateAppUserDetails']);
Route::get('/users/search', [UserController::class, 'searchUsers']);

Route::delete('/users',[UserController::class, 'deleteUser'] );

Route::group(
    ['middleware' => 'auth:sanctum'],
    function () {
        Route::get('userDetails', [UserController::class, 'getUserDetails']); //completed
    Route::get('logout', [UserController::class, 'logout']); //completed
        Route::post('/user/update-details', [UserController::class, 'updateUserDetails']);
        Route::post('/user/update', [UserController::class, 'updateSelfDetails']);

        Route::get('/user-role', [UserController::class, 'getUserRole']);
        Route::post('/assign-user-role', [UserController::class, 'assignUserRole']);//Completed
        Route::post('assign-permission', [UserController::class, 'assignPermission']);//completed
        Route::delete('revoke-permission', [UserController::class, 'revokePermission']);//giving error
        Route::get('permissions', [UserController::class, 'getUserPermissions']);//completed
        Route::post('/register-by-admin', [UserController::class, 'registeredByAdmin']);
        Route::post('/store-fcm-token', [UserController::class, 'storeFCMToken']);
    }
);
//Email Verification
Route::post('/send-email-otp', [UserController::class, 'sendEmailWithOTP']);
Route::post('/send-custom-email', [UserController::class, 'sendCustomEmail']);

Route::get('/email/verify/{id}/{hash}', [UserController::class, 'verifyEmail'])
    ->middleware(['auth:sanctum', 'signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::post('/email/verification-notification', [UserController::class, 'resendVerificationEmail'])
    ->middleware(['auth:sanctum', 'throttle:6,1'])
    ->name('verification.send');

//Routes for property gorup
Route::get('properties/featured', [PropertyController::class, 'getFeaturedProperties']);
Route::get('properties/mostliked', [PropertyController::class, 'getMostLikedProperties']);
Route::get('/search-property', [PropertyController::class, 'searchProperty']);
Route::delete('properties/destroy-multiple', [PropertyController::class, 'destroyMultiple']);

Route::prefix('properties')->group(function () {
    Route::get('/{property}', [PropertyController::class, 'show'])->name('api.properties.show');
    Route::post('/', [PropertyController::class, 'store'])->name('api.properties.store');
    Route::put('/{property}', [PropertyController::class, 'update'])->name('api.properties.update');
    Route::delete('/{property}', [PropertyController::class, 'destroy'])->name('api.properties.destroy');
    Route::get('/{propertyId}/files', [FileController::class, 'getFilesForProperty']);
});
Route::post('/properties/details', [PropertyController::class, 'getPropertyDetailsByIds']);
Route::post('/search-properties-in-city', [PropertyController::class, 'searchPropertiesInCity']);


//Routes for rooms
Route::group(['prefix' => '/'], function () {
    Route::get('/rooms', [RoomController::class, 'index']);
    Route::get('/rooms/{room_id}', [RoomController::class, 'show']);
    Route::post('/rooms', [RoomController::class, 'store']);
    Route::put('/rooms/{room_id}', [RoomController::class, 'update']);
    Route::delete('/rooms', [RoomController::class, 'destroy']);
    Route::get('/rooms/{room_id}/property', [RoomController::class, 'getProperty']);
    Route::get('/properties/{propertyId}/rooms', [RoomController::class, 'getRoomsByPropertyId']);
});


//Check Availability Routes 
Route::post('/check-availability', [CheckAvailabilityController::class, 'checkAvailability']);

//Role Api
Route::resource('roles', RoleController::class);

// Routes for bookings
Route::post('/bookings/updateStatus', [BookingController::class, 'updateStatus']);

Route::get('/bookings', [BookingController::class, 'index']);
Route::get('/bookings/{bookingReference}', [BookingController::class, 'show']);
Route::post('/bookings', [BookingController::class, 'store']);
Route::put('/bookings/{bookingReference}', [BookingController::class, 'update']);
Route::delete('/bookings/{bookingReference}', [BookingController::class, 'destroy']);
Route::get('/bookings/details', [BookingController::class, 'getBookingDetails']);
Route::get('/user/bookings', [BookingController::class, 'getUserBookings'])->middleware('auth:sanctum');


Route::post('/webhook', [WebhookController::class, 'handle']);



// Route for getting available rooms
Route::post('/available-rooms', [BookingController::class, 'getAvailableRooms']);//completed
Route::get('/available-rooms-properties', [BookingController::class, 'getAvailableRoomsAndProperties']);
Route::post('book-room', [BookingController::class, 'bookRoom']);//completed
Route::post('/admin/book-rooms', [BookingController::class, 'adminBookRooms']);//completed

Route::resource('admin-logs', AdminLogsController::class);




Route::get('/properties', [PropertyController::class, 'index'])->name('api.properties.index');
// Routes for file upload
Route::post('/files/upload', [FileController::class, 'upload']);

// Route for downloading a file
Route::get('/files/download/{fileId}', [FileController::class, 'download']);

// Route for getting files associated with a property
Route::get('/files/property/{propertyId}', [FileController::class, 'getFilesForProperty']);

// Route for uploading base64 data
Route::post('/files/upload-base64', [FileController::class, 'uploadBase64']);
Route::post('/files/upload-for-user', [FileController::class, 'uploadForUser'])->name('files.upload.forUser');

Route::post('/uploadUser', [FileController::class, 'uploadUserImage']);
Route::post('/properties/{propertyId}/images', [FileController::class, 'uploadImagesForProperty']);

// Route to get favorite properties of the user
Route::get('/user/{userId}/favorite-properties', [UserController::class, 'getFavoriteProperties']);
Route::post('/user/favorite-properties', [UserController::class, 'addFavoriteProperty']);
Route::post('/user/favorite-properties/remove', [UserController::class, 'removeFavoriteProperty']);

Route::get('/properties/{propertyId}/reviews', [UserReviewController::class, 'index'])->name('reviews.index');
Route::get('/properties/{propertyId}/reviews/create', [UserReviewController::class, 'create'])->name('reviews.create');
Route::post('/reviews', [UserReviewController::class, 'store'])->middleware('auth:sanctum');

Route::resource('signatures', SignatureController::class)->only([
    'index', 'store', 'show', 'update', 'destroy',
]);
Route::get('get-signature-by-booking', [SignatureController::class, 'getSignaturesByBookingId']);


Route::post('/api/send-web-notification-to-all', [NotificationController::class, 'sendWebNotificationToAll']);

Route::post('/send-otp-mail', [EmailController::class, 'sendVerificationEmail']);
Route::post('/send-temporary-password', [EmailController::class, 'sendTemporaryPassword']);
