"""
SafeStreet Backend - Road Damage Detection API

This module provides a FastAPI-based REST API for processing road images to detect
and analyze various types of road damage using YOLO object detection and Google's
Gemini AI for detailed analysis.

Features:
    - Road damage detection using YOLOv8 model
    - AI-powered damage analysis using Google Gemini
    - Automatic image annotation with bounding boxes
    - Integration with Appwrite for storage and database management
    - Structured JSON reports with damage types, severity, and summaries

Author: SafeStreet Team
"""

# Standard library imports
import os
import shutil
import uuid
import mimetypes
from datetime import datetime

# Third-party imports
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import google.generativeai as genai
from dotenv import load_dotenv
import json

# Local imports
import appwrite_utils

# ============================================================================
# CONFIGURATION
# ============================================================================

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Ensure the 'tmp' directory exists for temporary file storage
TMP_DIR = "tmp"
os.makedirs(TMP_DIR, exist_ok=True)

# ============================================================================
# YOLO MODEL INITIALIZATION
# ============================================================================
try:
    model = YOLO("best.pt")
    print("YOLO model loaded successfully.")
except Exception as e:
    print(f"Error loading YOLO model: {e}")
    # Exit or handle gracefully if model cannot be loaded
    exit(1)

# Mapping from YOLO class codes to human-readable damage types
damage_type_mapping = {
    'D00': 'Pothole',
    'D10': 'Longitudinal Crack',
    'D20': 'Alligator Crack',
    'D40': 'Transverse Crack',
    'D50': 'Manhole'
}
print(f"Defined damage type mapping: {damage_type_mapping}")

# ============================================================================
# GEMINI AI INITIALIZATION
# ============================================================================

try:
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")
    genai.configure(api_key=gemini_api_key)
    gemini_model = genai.GenerativeModel('gemini-1.5-flash')
    print("Gemini Flash model configured successfully.")
except Exception as e:
    print(f"Error configuring Gemini API: {e}")
    exit(1)

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

async def generate_gemini_report(image_path: str, detections: list):
    """
    Generates a detailed report using Gemini based on the image and YOLO detections,
    requesting a structured JSON output.
    """
    try:
        # Prepare content for Gemini
        image_part = {
            'mime_type': mimetypes.guess_type(image_path)[0] or 'image/jpeg',
            'data': open(image_path, 'rb').read()
        }

        # Construct prompt for Gemini
        detection_summary = "\n".join([
            f"- Type: {det['type']}, Confidence: {det['confidence']:.2f}, Box: {det['box']}"
            for det in detections
        ])

        # Construct prompt requesting structured JSON output
        prompt_text = (
            "Analyze the provided image for road damage. "
            "Based on the image and the following YOLO detections, provide a report in **JSON format**.\n\n"
            "YOLO Detections:\n"
            f"{detection_summary}\n\n"
            "The JSON object should have the following keys:\n"
            "1. `summary`: A concise, single-sentence summary of the overall damage, max 200 characters.\n"
            "2. `damage_types`: An array of strings, listing all unique damage types detected (e.g., ['Pothole', 'Transverse Crack']).\n"
            "3. `overall_severity`: A single integer (1, 2, or 3) representing the overall severity of all damages. 1 for low, 2 for medium, 3 for high. Base this on a holistic assessment of all detected damages.\n"
            "Example JSON format:\n"
            "```json\n"
            "{\n"
            "  \"summary\": \"Overall summary of damage.\",\n"
            "  \"damage_types\": [\"Pothole\", \"Longitudinal Crack\"],\n"
            "  \"overall_severity\": 2\n"
            "}\n"
            "```\n"
            "Ensure the response is ONLY the JSON object, nothing else."
        )

        response = await gemini_model.generate_content_async([prompt_text, image_part])
        
        # Parse the JSON response (handle markdown code blocks if present)
        try:
            response_text = response.text.strip()
            if response_text.startswith("```json") and response_text.endswith("```"):
                json_string = response_text[len("```json"): -len("```")].strip()
            else:
                json_string = response_text
            
            parsed_report = json.loads(json_string)
            return parsed_report
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON from Gemini: {e}")
            print(f"Gemini raw response: {response.text}")
            # Fallback to a default structure if JSON parsing fails
            return {
                "summary": "Failed to generate structured summary.",
                "damage_types": ["Unknown"],
                "overall_severity": 0 # Use 0 or another indicator for failed severity
            }

    except Exception as e:
        print(f"Error generating Gemini report: {e}")
        return {
            "summary": f"Failed to generate report: {e}",
            "damage_types": ["Error"],
            "overall_severity": 0
        }

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.post("/process-image/")
async def process_image(
    file: UploadFile = File(...),
    original_image_id: str = Form(..., description="The imageId of the record in Appwrite to update or create.")
):
    """
    Process uploaded road image for damage detection and analysis.
    
    Args:
        file: Uploaded image file
        original_image_id: ID of the record in Appwrite database
    
    Returns:
        JSONResponse with processing results including damage analysis and file IDs
    
    Raises:
        HTTPException: If processing fails or Appwrite operations fail
    """
    input_file_path = os.path.join(TMP_DIR, f"{uuid.uuid4()}_{file.filename}")
    annotated_file_path = os.path.join(TMP_DIR, f"annotated_{uuid.uuid4()}.jpg")
    report_file_path = os.path.splitext(annotated_file_path)[0] + "_report.txt"

    try:
        # 1. Save the uploaded image locally
        with open(input_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 2. Perform YOLO detection
        results = model(input_file_path)

        detections = []
        for r in results:
            # Save annotated image with bounding boxes drawn by YOLO
            r.save(filename=annotated_file_path)
            # Extract detection details
            for *xyxy, conf, cls in r.boxes.data:
                class_name = model.names[int(cls)]
                mapped_type = damage_type_mapping.get(class_name, class_name)
                detections.append({
                    "type": mapped_type,
                    "confidence": float(conf),
                    "box": [float(v) for v in xyxy]
                })
                print(f"Analyzing detection {len(detections)}: {mapped_type} with confidence {float(conf):.2f}...")

        # 3. Generate AI-powered analysis report using Gemini
        gemini_structured_report = await generate_gemini_report(input_file_path, detections)
        
        # Extract data from the structured report
        report_summary = gemini_structured_report.get("summary", "No summary provided by Gemini.")
        damage_types_str = ", ".join(gemini_structured_report.get("damage_types", ["Unknown"]))
        overall_severity = str(gemini_structured_report.get("overall_severity", 0))

        # Save the structured report as JSON for debugging and records
        with open(report_file_path, "w", encoding="utf-8") as f:
            f.write(json.dumps(gemini_structured_report, indent=2))
        print(f"✅ Structured report saved to {report_file_path}")


        # 4. Upload annotated image to Appwrite Storage
        appwrite_bucket_id = os.getenv("APPWRITE_BUCKET_ID")
        if not appwrite_bucket_id:
            raise ValueError("APPWRITE_BUCKET_ID not found in environment variables. Image will not be uploaded to storage.")

        uploaded_file_id = await appwrite_utils.upload_to_storage(
            annotated_file_path,
            appwrite_bucket_id
        )

        if not uploaded_file_id:
            raise HTTPException(status_code=500, detail="Failed to upload annotated image to Appwrite Storage.")
        print(f"✅ Annotated image uploaded to Appwrite Storage with ID: {uploaded_file_id}")

        # 5. Prepare data for Appwrite Database
        appwrite_data = {
            "imageId": original_image_id,
            "timestamp": datetime.now().isoformat(),
            "Type": damage_types_str,
            "Severity": overall_severity,
            "Summary": report_summary,
            "Status": "Processed",
            "processedImageId": uploaded_file_id
        }

        # 6. Update or create Appwrite Database record
        appwrite_response = await appwrite_utils.update_damage_record(
            original_image_id,
            appwrite_data
        )

        if appwrite_response:
            return JSONResponse(
                status_code=200,
                content={
                    "status": "success",
                    "message": "Image processed, report generated, and database updated.",
                    "original_image_id": original_image_id,
                    "processed_image_appwrite_id": uploaded_file_id,
                    "report_summary": report_summary,
                    "appwrite_document_id": appwrite_response['$id']
                }
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to update Appwrite database.")

    except Exception as e:
        print(f"Unhandled exception during processing: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

    finally:
        # Clean up temporary files
        if os.path.exists(input_file_path):
            os.remove(input_file_path)
        if os.path.exists(annotated_file_path):
            os.remove(annotated_file_path)
        if os.path.exists(report_file_path):
            os.remove(report_file_path)
