# Use a slim Python base image for smaller size
FROM python:3.10-slim-buster

# Set the working directory inside the container
WORKDIR /app

# Copy requirements.txt and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install OpenCV dependencies for image processing (important for headless environments)
# This helps with potential issues with cv2.imread and cv2.imwrite
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy all your application files into the container
# This includes appwrite_utils.py, inference.py, main.py, and best.pt
COPY . .

# Ensure the YOLO model has correct permissions and is accessible
# This might not be strictly necessary if copied correctly, but good for robustness
RUN chmod +r best.pt

# Create a temporary directory that FastAPI uses
RUN mkdir -p tmp

# Expose the port FastAPI will listen on. Hugging Face Spaces typically uses 7860 for Gradio/Streamlit,
# but for custom Docker apps, it can be 7860 or 80. Let's use 7860 as it's common for Spaces.
EXPOSE 7860

# Command to run your FastAPI application with Uvicorn
# Use 0.0.0.0 to bind to all network interfaces
# The port should match the EXPOSE port, or be configurable via an environment variable if needed.
# Hugging Face Spaces will set the PORT environment variable for you.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
