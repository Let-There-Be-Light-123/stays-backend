<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;


class FileController extends Controller
{
    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'files.*' => 'required_without:base64_data|file|mimes:pdf,doc,docx,jpg,jpeg,png,gif|max:20480',
            'base64_data.*' => 'required_without:files.*|string',
            'property_id' => 'required_without_all:booking_id,user_id',
            'booking_id' => 'required_without_all:property_id,user_id',
            'user_id' => 'required_without_all:property_id,booking_id',
            'resumableChunkNumber.*' => 'required|numeric',
            'resumableChunkSize.*' => 'required|numeric',
            'resumableTotalSize.*' => 'required|numeric',
            'resumableIdentifier.*' => 'required|string',
            'resumableFilename.*' => 'required|string',
        ]);
    
        if ($validator->fails()) {
            Log::error('Validation failed during file upload.', ['errors' => $validator->errors()]);
            return response()->json(['error' => $validator->errors()], 400);
        }
    
        if ($request->has('base64_data')) {
            return $this->uploadBase64($request);
        }
    
        foreach ($request->file('files') as $index => $file) {
            $chunkPath = storage_path('app/public/uploads/temp/' . $request->resumableIdentifier[$index]);
            $chunkFilename = $request->resumableFilename[$index] . '.part' . $request->resumableChunkNumber[$index];
    
            $file->move($chunkPath, $chunkFilename);
            Log::info("File chunk moved to temporary folder. Chunk Path: $chunkPath, Chunk Filename: $chunkFilename");
    
            $chunks = glob($chunkPath . '/*');
            if (count($chunks) == $request->resumableTotalChunks[$index]) {
                $this->mergeChunks(
                    $chunkPath,
                    $request->resumableFilename[$index],
                    $request->property_id,
                    $request->booking_id,
                    $request->user_id
                );
                Log::info('All file chunks uploaded and merged into a single file.');
    
                $this->cleanUpChunks($chunkPath);
                Log::info('Temporary chunks cleaned up.');
            }
        }
    
        return response()->json(['message' => 'Files uploaded successfully']);
    }
    private function mergeChunks($chunkPath, $filename, $propertyId = null, $bookingId = null, $userId = null)
    {
        $targetPath = storage_path('app/public/uploads/');
        $targetFilename = $filename;
        $entityId = $propertyId ?: $bookingId ?: $userId;

        $folderPath = storage_path("app/public/uploads/{$entityId}/");

        if (!file_exists($folderPath)) {
            mkdir($folderPath, 0777, true);
        }

        $filepath = "public/uploads/{$entityId}/{$filename}";

        foreach (glob($chunkPath . '/*') as $chunk) {
            file_put_contents($targetPath . $targetFilename, file_get_contents($chunk), FILE_APPEND);
        }

        $fileModel = new File([
            'property_id' => $propertyId,
            'booking_id' => $bookingId,
            'user_id' => $userId,
            'filename' => $filepath,
            'filepath' => 'public/uploads/' . $filename,
            'filetype' => mime_content_type($targetPath . $targetFilename),
        ]);

        $fileModel->save();
    }

    private function cleanUpChunks($chunkPath)
    {
        foreach (glob($chunkPath . '/*') as $chunk) {
            unlink($chunk);
        }
        rmdir($chunkPath);
    }

    public function download($fileId)
    {
        $file = File::findOrFail($fileId);

        return Storage::download($file->filepath, $file->filename);
    }

    public function getFilesForProperty($propertyId)
    {
        try {
            $files = File::where('property_id', $propertyId)->get();
            return response()->json(['status' => 'success', 'data' => $files]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function uploadBase64(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'base64_data' => 'required|string',
            'property_id' => 'required_without_all:booking_id,user_id',
            'booking_id' => 'required_without_all:property_id,user_id',
            'user_id' => 'required_without_all:property_id,booking_id',
            'filename' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        $base64Data = $request->base64_data;
        $decodedData = base64_decode($base64Data);

        // Save the decoded data to the storage
        $path = $this->storeBase64File($decodedData, $request->filename, $request->property_id, $request->booking_id, $request->user_id);

        // Save file information to the database
        $fileModel = new File([
            'property_id' => $request->property_id,
            'booking_id' => $request->booking_id,
            'user_id' => $request->user_id,
            'filename' => $request->filename,
            'filepath' => $path,
            'filetype' => mime_content_type($path),
        ]);

        $fileModel->save();

        return response()->json(['message' => 'File uploaded successfully']);
    }

    private function storeBase64File($data, $filename, $propertyId, $bookingId, $userId)
    {
        $targetPath = storage_path('app/public/uploads/');
        $targetFilename = $filename;

        // Save the decoded data to the storage
        file_put_contents($targetPath . $targetFilename, $data);

        return 'public/uploads/' . $filename;
    }


    public function uploadForUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'files.*' => 'required_without:base64_data|file|mimes:pdf,doc,docx,jpg,jpeg,png,gif|max:20480',
            'base64_data.*' => 'required_without:files.*|string',
            'user_id' => 'required_without_all:property_id,booking_id',
            'resumableChunkNumber.*' => 'required|numeric|default:1', // Replace '1' with the default resumableChunkNumber value
            'resumableChunkSize.*' => 'required|numeric|default:1024', // Replace '1024' with the default resumableChunkSize value
            'resumableTotalSize.*' => 'required|numeric|default:20480', // Replace '20480' with the default resumableTotalSize value
            'resumableIdentifier.*' => 'required|string|default:default_identifier', // Replace 'default_identifier' with the default resumableIdentifier value
            'resumableFilename.*' => 'required|string|default:default_filename', // Replace 'default_filename' with the default resumableFilename value
        ]);

        if ($validator->fails()) {
            Log::error('Validation failed during file upload.', ['errors' => $validator->errors()]);
            return response()->json(['error' => $validator->errors()], 400);
        }

        if ($request->has('base64_data')) {
            return $this->uploadBase64ForUser($request);
        }

        foreach ($request->file('files') as $index => $file) {
            $chunkPath = storage_path('app/public/uploads/temp/' . $request->resumableIdentifier[$index]);
            $chunkFilename = $request->resumableFilename[$index] . '.part' . $request->resumableChunkNumber[$index];
            $file->move($chunkPath, $chunkFilename);
            Log::info("File chunk moved to temporary folder. Chunk Path: $chunkPath, Chunk Filename: $chunkFilename");
            $chunks = glob($chunkPath . '/*');
            if (count($chunks) == $request->resumableTotalChunks[$index]) {
                $this->mergeChunks(
                    $chunkPath,
                    $request->resumableFilename[$index],
                    null,
                    null,
                    $request->user_id
                );
                Log::info('All file chunks uploaded and merged into a single file.');
                $this->cleanUpChunks($chunkPath);
                Log::info('Temporary chunks cleaned up.');
            }
        }

        return response()->json(['message' => 'Files uploaded successfully']);
    }

    private function uploadBase64ForUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'base64_data' => 'required|string',
            'user_id' => 'required_without_all:property_id,booking_id',
            'filename' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        $base64Data = $request->base64_data;
        $decodedData = base64_decode($base64Data);
        $path = $this->storeBase64File($decodedData, $request->filename, null, null, $request->user_id);
        $fileModel = new File([
            'user_id' => $request->user_id,
            'filename' => $request->filename,
            'filepath' => $path,
            'filetype' => mime_content_type($path),
        ]);
        $fileModel->save();
        return response()->json(['message' => 'File uploaded successfully']);
    }
    public function uploadUserImage(Request $request)
    {
        try {
            $userId = $request->input('user_id');
            $userDirectory = "public/uploads/users/{$userId}";
    
            if (!Storage::exists($userDirectory)) {
                File::makeDirectory($userDirectory, 0777, true);
                chmod($userDirectory, 0777);
            }
    
            $existingFile = File::where('social_security', $userId)->first();
    
            if ($existingFile) {
                Storage::delete("{$userDirectory}/{$existingFile->filename}");
                $image = $request->file('image');
                $imageType = $image->getMimeType();
                $filename = time() . '_' . $image->getClientOriginalName();
                $image->storeAs($userDirectory, $filename);
                $existingFile->filename = $filename;
                $existingFile->filepath = Storage::url("{$userDirectory}/{$filename}");
                $existingFile->filetype = $imageType;
                $existingFile->save();
            } else {
                $image = $request->file('image');
                $imageType = $image->getMimeType();
                \Log::info("Image type received for user {$userId}: {$imageType}");
    
                $filename = time() . '_' . $image->getClientOriginalName();
                $image->storeAs($userDirectory, $filename);
                \Log::info("Image uploaded for user {$userId}: {$filename}");
    
                $file = new File();
                $file->social_security = $userId;
                $file->filename = $filename;
                $file->filepath = Storage::url("{$userDirectory}/{$filename}");
                $file->filetype = $imageType;
                $file->save();
            }
    
            return response()->json(['message' => 'Image uploaded successfully']);
        } catch (\Exception $e) {
            \Log::error("Error uploading image: {$e->getMessage()}");
            return response()->json(['error' => 'Image upload failed'], 500);
        }
    }
    public function uploadImagesForProperty(Request $request, $propertyId)
    {
        try {
            $request->validate([
                'images.*' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:20480',
            ]);
    
            $property = Property::find($propertyId);
            $propertyName = $property->name ?? 'property';
            $propertyDirectory = "public/uploads/properties/{$propertyId}";
            File::makeDirectory($propertyDirectory, 0777, true);
            chmod($propertyDirectory, 0777);
    
            $uploadedFiles = [];
            Log::info($request);
            foreach ($request->file('images') as $image) {
                $filename = Str::slug($propertyName) . '_' . time() . '.' . $image->getClientOriginalExtension();
                $image->storeAs($propertyDirectory, $filename);
    
                $uploadedFiles[] = [
                    'property_id' => $propertyId,
                    'filename' => $filename,
                    'filepath' => Storage::url("{$propertyDirectory}/{$filename}"),
                    'filetype' => $image->getMimeType(),
                ];
            }
    
            File::insert($uploadedFiles);
    
            return response()->json(['message' => 'Images uploaded successfully']);
        } catch (\Exception $e) {
            \Log::error("Error uploading images: {$e->getMessage()}");
            return response()->json(['error' => 'Image upload failed'], 500);
        }
    }
    
}