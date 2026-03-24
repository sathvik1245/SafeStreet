# SafeStreet Backend - Road Damage Detection API

A FastAPI-based backend service for detecting and analyzing road damage using YOLOv8 object detection and Google Gemini AI. This service powers the SafeStreet application for automated road infrastructure monitoring.

## 🌟 Features

- **AI-Powered Detection**: YOLOv8 model trained to detect multiple types of road damage
- **Intelligent Analysis**: Google Gemini AI provides detailed damage assessment and repair recommendations
- **Automated Reporting**: Generates structured JSON reports with damage types, severity scores, and summaries
- **Cloud Integration**: Seamless integration with Appwrite for storage and database management
- **Production Ready**: Deployed on Hugging Face Spaces with Docker containerization

## 🛠️ Technology Stack

- **Framework**: FastAPI
- **Object Detection**: YOLOv8 (Ultralytics)
- **AI Analysis**: Google Gemini 1.5 Flash
- **Backend Services**: Appwrite (Database & Storage)
- **Deployment**: Docker, Hugging Face Spaces
- **Language**: Python 3.10

## 📋 Damage Types Detected

The system can detect and classify the following types of road damage:

| Code | Damage Type          | Description                          |
|------|---------------------|--------------------------------------|
| D00  | Pothole             | Holes in road surface                |
| D10  | Longitudinal Crack  | Cracks parallel to road direction    |
| D20  | Alligator Crack     | Interconnected cracks forming pattern|
| D40  | Transverse Crack    | Cracks perpendicular to road         |
| D50  | Manhole             | Manhole cover issues                 |

## 🚀 Getting Started

### Prerequisites

- Python 3.10 or higher
- pip package manager
- YOLO model file (`best.pt`)
- Google Gemini API key
- Appwrite account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Download the YOLO model**
   
   Place your trained `best.pt` model file in the project root directory. This file is not included in the repository due to its size.

5. **Configure environment variables**
   
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your actual values:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=your_project_id
   APPWRITE_API_KEY=your_api_key
   APPWRITE_BUCKET_ID=your_bucket_id
   APPWRITE_DATABASE_ID=your_database_id
   APPWRITE_COLLECTION_ID=your_collection_id
   ```

### Running Locally

Start the development server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## 📡 API Documentation

### Process Image Endpoint

**POST** `/process-image/`

Processes an uploaded road image to detect and analyze damage.

#### Request

- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `file` (file, required): Image file to process
  - `original_image_id` (string, required): Unique identifier for the image record

#### Response

```json
{
  "status": "success",
  "message": "Image processed, report generated, and database updated.",
  "original_image_id": "image_123",
  "processed_image_appwrite_id": "file_456",
  "report_summary": "Multiple potholes detected with moderate severity.",
  "appwrite_document_id": "doc_789"
}
```

#### Example Usage

```bash
curl -X POST "http://localhost:8000/process-image/" \
  -F "file=@road_image.jpg" \
  -F "original_image_id=image_001"
```

### Interactive API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t safestreet-backend .
```

### Run Docker Container

```bash
docker run -p 7860:7860 --env-file .env safestreet-backend
```

## 🏗️ Project Structure

```
backend/
├── main.py                 # FastAPI application and endpoints
├── inference.py            # YOLO + Gemini inference logic
├── appwrite_utils.py       # Appwrite database and storage utilities
├── requirements.txt        # Python dependencies
├── Dockerfile             # Docker configuration
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
├── best.pt               # YOLO model weights (not in repo)
└── tmp/                  # Temporary file storage
```

## 🔧 Configuration

### Appwrite Setup

1. Create a new Appwrite project
2. Create a database and collection with the following attributes:
   - `imageId` (string)
   - `timestamp` (string)
   - `Type` (string)
   - `Severity` (string)
   - `Summary` (string)
   - `Status` (string)
   - `processedImageId` (string)
3. Create a storage bucket for processed images
4. Generate an API key with appropriate permissions

### Google Gemini API

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the key to your `.env` file

## 📊 How It Works

1. **Image Upload**: Client uploads a road image via the API
2. **YOLO Detection**: YOLOv8 model detects damage locations and types
3. **AI Analysis**: Google Gemini analyzes each detection for severity and recommendations
4. **Image Annotation**: Bounding boxes and labels are drawn on the image
5. **Storage**: Annotated image is uploaded to Appwrite Storage
6. **Database Update**: Damage record is created/updated in Appwrite Database
7. **Response**: Client receives structured report with all analysis data

## 🔒 Security Notes

- Never commit `.env` file to version control
- Keep API keys and credentials secure
- Use environment variables for all sensitive data
- The `.gitignore` file is configured to exclude sensitive files

## 🤝 Contributing

This is a private project for the SafeStreet application. For questions or issues, please contact the development team.

## 📄 License

Proprietary - All rights reserved

## 👥 Authors

SafeStreet Team

## 🙏 Acknowledgments

- YOLOv8 by Ultralytics
- Google Gemini AI
- Appwrite Backend-as-a-Service
- FastAPI Framework
