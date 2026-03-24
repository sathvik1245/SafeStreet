"""
Road Damage Detection Inference Module

This module provides the Predictor class for performing road damage detection
using YOLO object detection and Google Gemini AI for detailed analysis.

Features:
    - YOLO-based damage detection with bounding box visualization
    - AI-powered severity analysis using Google Gemini
    - Damage scoring based on confidence and severity
    - Detailed report generation with repair recommendations

Author: SafeStreet Team
"""

# Standard library imports
import os

# Third-party imports
import cv2
import torch
import numpy as np
from ultralytics import YOLO
from PIL import Image
import google.generativeai as genai


class Predictor:
    """
    Road damage detection and analysis predictor.
    
    This class combines YOLO object detection with Google Gemini AI to detect,
    analyze, and report on road damage in images.
    
    Attributes:
        yolo_model: Loaded YOLO model for damage detection
        yolo_class_names: Mapping of class IDs to class names
        damage_type_mapping: Mapping of YOLO codes to human-readable damage types
        gemini_model: Google Gemini model for AI-powered analysis
    """
    
    def __init__(self, yolo_model_path, gemini_api_key):
        """
        Initialize the Predictor with YOLO and Gemini models.
        
        Args:
            yolo_model_path: Path to the YOLO model file (.pt)
            gemini_api_key: Google Gemini API key
        
        Raises:
            AssertionError: If YOLO model file doesn't exist
            Exception: If model loading or API configuration fails
        """
        assert os.path.exists(yolo_model_path), f"YOLO model not found at {yolo_model_path}"

        # Load YOLO model with environment variable workaround
        original_torch_load_env = os.environ.get("TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD")
        os.environ["TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD"] = "1"
        try:
            self.yolo_model = YOLO(yolo_model_path)
            print("YOLO model loaded successfully.")
        except Exception as e:
            print(f"Fatal Error during YOLO model loading: {e}")
            raise e
        finally:
            if original_torch_load_env is not None:
                os.environ["TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD"] = original_torch_load_env
            elif "TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD" in os.environ:
                del os.environ["TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD"]

        # Store YOLO class names and damage type mappings
        self.damage_type_mapping = {
            'D00': 'Longitudinal Crack',
            'D10': 'Transverse Crack',
            'D20': 'Alligator Crack',
            'D40': 'Pothole',
            'D50': 'Manhole'
        }
        print(f"Defined damage type mapping: {self.damage_type_mapping}")

        # Initialize Gemini AI model
        try:
            genai.configure(api_key=gemini_api_key)
            self.gemini_model = genai.GenerativeModel('gemini-1.5-flash-latest')
            print("Gemini Flash model configured successfully.")
        except Exception as e:
            print(f"Fatal Error during Gemini configuration: {e}")
            raise e

    def generate_gemini_response(self, image_crop, damage_type):
        """
        Generate AI-powered analysis for detected road damage.
        
        Args:
            image_crop: PIL Image object of the cropped damage area
            damage_type: Type of damage detected (e.g., "Pothole")
        
        Returns:
            str: Detailed analysis text from Gemini AI
        """
        prompt = (
            f"This image shows a type of road damage identified as '{damage_type}'. "
            f"Your task is to act as a road maintenance expert. "
            f"Analyze the image and provide a concise report. "
            f"Structure your response with three distinct sections: "
            f"1. **Severity Analysis:** Describe the severity of the damage (e.g., minor, moderate, severe) and explain why. "
            f"2. **Location Description:** Briefly describe where the damage is located within the provided image crop. "
            f"3. **Repair Recommendations:** Suggest specific, actionable repair steps for this type of damage. Be practical and clear."
        )
        try:
            response = self.gemini_model.generate_content([prompt, image_crop])
            if not response.parts:
                return "Content generation was blocked by safety settings. Cannot provide analysis."
            return response.text
        except Exception as e:
            print(f"Error generating response from Gemini: {e}")
            return "Failed to generate analysis from Gemini due to an API error."

    def predict_and_report(self, image_path, save_path):
        """
        Detect road damage in an image and generate a comprehensive report.
        
        This method performs YOLO detection, generates AI analysis for each
        detection, calculates damage scores, annotates the image, and saves
        both the annotated image and a detailed text report.
        
        Args:
            image_path: Path to the input image
            save_path: Path where annotated image will be saved
        
        Returns:
            tuple: (detections_list, report_text)
                - detections_list: List of detection dictionaries
                - report_text: Full text report as a string
        
        Raises:
            FileNotFoundError: If input image doesn't exist or can't be read
        """
        original_image = cv2.imread(image_path)
        if original_image is None:
            raise FileNotFoundError(f"Image not found or could not be read: {image_path}")

        # Perform YOLO inference
        yolo_results = self.yolo_model.predict(image_path, verbose=False)
        report_summary = []
        detections = []

        # Check for detections
        if not yolo_results or not yolo_results[0].boxes:
            print("No detections found by YOLO model.")
        else:
            # Process each detected damage
            for j, box in enumerate(yolo_results[0].boxes):
                # Extract bounding box coordinates
                xyxy = box.xyxy[0].cpu().numpy().astype(int)
                x1, y1, x2, y2 = xyxy

                # Validate bounding box
                if y2 <= y1 or x2 <= x1:
                    print(f"Skipping invalid bounding box: [{x1}, {y1}, {x2}, {y2}]")
                    continue

                # Crop the damage area from the image
                cropped_image_cv = original_image[y1:y2, x1:x2]
                if cropped_image_cv.size == 0:
                    print(f"Skipping empty cropped image for box: [{x1}, {y1}, {x2}, {y2}]")
                    continue

                # Convert to PIL Image for Gemini
                if cropped_image_cv.shape[0] > 0 and cropped_image_cv.shape[1] > 0:
                    cropped_image_pil = Image.fromarray(cv2.cvtColor(cropped_image_cv, cv2.COLOR_BGR2RGB))
                else:
                    print(f"Skipping invalid cropped image (zero dimension) for box: [{x1}, {y1}, {x2}, {y2}]")
                    continue

                # Extract detection metadata
                conf = box.conf[0].cpu().item()
                cls_id = int(box.cls[0].cpu().item())
                yolo_code_name = self.yolo_class_names[cls_id]
                descriptive_damage_name = self.damage_type_mapping.get(yolo_code_name, yolo_code_name)

                # Generate AI analysis
                print(f"Analyzing detection {j+1}: {descriptive_damage_name} with confidence {conf:.2f}...")
                gemini_analysis_text = self.generate_gemini_response(cropped_image_pil, descriptive_damage_name)

                severity_text_extracted = ""
                location_text_extracted = ""
                repair_text_extracted = ""
                numerical_severity = 0

                # Parse Gemini response for severity and other details
                if "**1. Severity Analysis:**" in gemini_analysis_text:
                    parts = gemini_analysis_text.split("**1. Severity Analysis:**", 1)
                    if len(parts) > 1:
                        severity_section_content = parts[1].split("**2. Location Description:**", 1)
                        severity_text_extracted = severity_section_content[0].strip()

                        if "severe" in severity_text_extracted.lower():
                            numerical_severity = 3
                        elif "moderate" in severity_text_extracted.lower():
                            numerical_severity = 2
                        elif "minor" in severity_text_extracted.lower():
                            numerical_severity = 1

                        if len(severity_section_content) > 1:
                            location_section_content = severity_section_content[1].split("**3. Repair Recommendations:**", 1)
                            location_text_extracted = location_section_content[0].strip()
                            if len(location_section_content) > 1:
                                repair_text_extracted = location_section_content[1].strip()

                # Calculate damage score (0-100)
                damage_score = (conf * numerical_severity / 3.0) * 100 if numerical_severity > 0 else 0
                damage_score = round(max(0, min(100, damage_score)), 2)

                # Create report entry for this detection
                report_entry = (
                    f"Detection {j+1}:\n"
                    f"  - Damage Type: {descriptive_damage_name} ({yolo_code_name})\n"
                    f"  - Bounding Box: [{x1}, {y1}, {x2}, {y2}]\n"
                    f"  - Confidence: {conf:.2f}\n"
                    f"  - Numerical Severity: {numerical_severity} (1=Minor, 2=Moderate, 3=Severe)\n"
                    f"  - Damage Score: {damage_score:.2f} (out of 100)\n"
                    f"  - Expert Analysis:\n{gemini_analysis_text}\n"
                )
                report_summary.append(report_entry)

                # Store detection data
                detections.append({
                    "damage_type": descriptive_damage_name,
                    "bbox": [int(x1), int(y1), int(x2), int(y2)],
                    "confidence": round(conf, 2),
                    "numerical_severity": numerical_severity,
                    "damage_score": damage_score,
                    "analysis_text": gemini_analysis_text
                })

                # Draw bounding box and label on image
                cv2.rectangle(original_image, (x1, y1), (x2, y2), (0, 0, 255), 2)
                label = f"{descriptive_damage_name} (Score:{damage_score:.0f})"
                cv2.putText(original_image, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)

        # Save annotated image
        cv2.imwrite(save_path, original_image)

        # Save report to a text file
        report_path = os.path.splitext(save_path)[0] + "_report.txt"
        with open(report_path, 'w') as f:
            f.write("Road Damage Detection Report\n============================\n\n")
            if report_summary:
                f.write("\n".join(report_summary))
            else:
                f.write("No damage detected in the image.\n")

        print(f"✅ Annotated image saved to {save_path}")
        print(f"✅ Text report saved to {report_path}")

        return detections, "\n".join(report_summary) if report_summary else "No damage detected."