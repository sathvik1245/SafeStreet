"""
Appwrite Utilities - Database and Storage Operations

This module provides utility functions for interacting with Appwrite's database
and storage services. It handles file uploads and database record management
for the SafeStreet road damage detection system.

Key Features:
    - Direct HTTP-based file upload to Appwrite Storage (bypasses SDK issues)
    - Database record creation and updates with automatic data cleaning
    - Handles Appwrite metadata fields automatically
    - Async/await support for non-blocking operations

Author: SafeStreet Team
"""

# Standard library imports
import os
import io

# Third-party imports
import httpx
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.services.storage import Storage
from appwrite.query import Query
from appwrite.id import ID
from dotenv import load_dotenv
import mimetypes

# ============================================================================
# CONFIGURATION
# ============================================================================

load_dotenv()

# Initialize Appwrite Client
client = Client()
client.set_endpoint(os.getenv("APPWRITE_ENDPOINT"))
client.set_project(os.getenv("APPWRITE_PROJECT_ID"))
client.set_key(os.getenv("APPWRITE_API_KEY"))

# Initialize Appwrite services
db = Databases(client)
storage = Storage(client)

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def _clean_appwrite_data(data: dict) -> dict:
    """
    Removes Appwrite's internal metadata fields from a dictionary
    before sending it back for document update/creation.
    """
    cleaned_data = data.copy()
    # List of Appwrite internal attributes to remove
    internal_keys = [
        '$id', '$createdAt', '$updatedAt', '$permissions',
        '$databaseId', '$collectionId'
    ]
    for key in internal_keys:
        cleaned_data.pop(key, None) # Use pop with None default to avoid KeyError if key doesn't exist
    return cleaned_data

# ============================================================================
# PUBLIC FUNCTIONS
# ============================================================================

async def upload_to_storage(file_path: str, bucket_id: str):
    """
    Upload a file to Appwrite Storage using direct HTTP requests.
    
    This function bypasses the Appwrite SDK's file upload method and uses
    direct HTTP requests via httpx to avoid SDK-related file handling issues.
    
    Args:
        file_path: Absolute path to the file to upload
        bucket_id: Appwrite storage bucket ID
    
    Returns:
        str: Appwrite file ID if successful, None otherwise
    
    Raises:
        httpx.HTTPStatusError: If the HTTP request fails
    """
    try:
        file_name = os.path.basename(file_path)
        # Determine MIME type from file extension
        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type:
            mime_type = "application/octet-stream"

        # Read the entire file content into memory as bytes
        with open(file_path, "rb") as f:
            file_content = f.read()

        # Generate a unique file ID
        appwrite_file_id = ID.unique()

        # Get Appwrite configuration from environment
        appwrite_endpoint = os.getenv("APPWRITE_ENDPOINT")
        project_id = os.getenv("APPWRITE_PROJECT_ID")
        api_key = os.getenv("APPWRITE_API_KEY")

        # Construct upload URL
        upload_url = f"{appwrite_endpoint}/storage/buckets/{bucket_id}/files"

        # Prepare request headers
        headers = {
            "X-Appwrite-Project": project_id,
            "X-Appwrite-Key": api_key,
            # Content-Type will be set automatically by httpx for multipart/form-data
        }

        # Prepare multipart form data
        files = {
            'file': (file_name, file_content, mime_type)
        }
        
        # Set file permissions
        data = {
            'fileId': appwrite_file_id,
            'permissions[]': ['read("any")', 'write("any")']
        }

        # Upload file using async HTTP client
        print(f"DEBUG: Attempting direct HTTPX upload of '{file_name}' to bucket '{bucket_id}'...")
        async with httpx.AsyncClient() as http_client:
            response = await http_client.post(upload_url, headers=headers, files=files, data=data)
        
        response.raise_for_status()

        result = response.json()
        print(f"✅ Uploaded file via HTTPX. File ID: {result['$id']}")
        return result["$id"]

    except httpx.HTTPStatusError as e:
        print(f"❌ HTTPX Upload failed with status {e.response.status_code}: {e.response.text}")
        return None
    except Exception as e:
        print(f"❌ Upload failed: {e}")
        return None


async def update_damage_record(original_image_id: str, data: dict):
    """
    Update or create a damage record in Appwrite database.
    
    This function searches for an existing record with the given imageId.
    If found, it updates the record with new data. If not found, it creates
    a new record. All Appwrite internal metadata fields are automatically
    cleaned before sending data.
    
    Args:
        original_image_id: Unique identifier for the image
        data: Dictionary containing damage record data
    
    Returns:
        dict: Appwrite document response if successful, None otherwise
    """
    database_id = os.getenv("APPWRITE_DATABASE_ID")
    collection_id = os.getenv("APPWRITE_COLLECTION_ID")

    try:
        # Query for existing document with matching imageId
        # This checks if a record for this image already exists in the database.
        query_result = db.list_documents(
            database_id=database_id,
            collection_id=collection_id,
            queries=[Query.equal("imageId", original_image_id)]
        )

        # Check if document exists
        if query_result.get('total', 0) > 0:
            document_id = query_result['documents'][0]['$id']
            existing_document_data = query_result['documents'][0]

            # Merge new data with existing document data
            # This ensures that fields not present in 'data' but existing
            # in the document are preserved, and new/updated fields from
            # 'data' overwrite old ones.
            merged_data = existing_document_data.copy()
            merged_data.update(data)

            # Remove Appwrite metadata fields
            data_to_send = _clean_appwrite_data(merged_data)

            # Update the existing document

            updated_document = db.update_document(
                database_id=database_id,
                collection_id=collection_id,
                document_id=document_id,
                data=data_to_send
            )
            print(f"✅ Document {document_id} updated successfully.")
            return updated_document
        else:
            # Create new document if none exists
            data["imageId"] = original_image_id
            data_to_send = _clean_appwrite_data(data)

            new_document = db.create_document(
                database_id=database_id,
                collection_id=collection_id,
                document_id=ID.unique(),
                data=data_to_send
            )
            print(f"✅ New document created for imageId: {original_image_id}. Document ID: {new_document['$id']}")
            return new_document

    except Exception as e:
        print(f"❌ Failed to update/create document in Appwrite: {e}")
        return None






