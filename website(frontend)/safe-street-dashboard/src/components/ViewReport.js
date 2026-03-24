

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { databases, storage } from './appwriteConfig';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import './ViewReport.css';
import L from 'leaflet';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
// Environment variables for Appwrite configuration
const databaseId = process.env.REACT_APP_APPWRITE_DATABASE_ID;
const collectionId = process.env.REACT_APP_APPWRITE_COLLECTION_ID;
const BUCKET_ID = process.env.REACT_APP_APPWRITE_BUCKET_ID;
const PROJECT_ID = process.env.REACT_APP_APPWRITE_PROJECT_ID;
const ENDPOINT = process.env.REACT_APP_APPWRITE_ENDPOINT;

const ViewReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await databases.getDocument(databaseId, collectionId, id);
        setReport(response);
      } catch (error) {
        console.error("Failed to fetch report:", error);
      }
    };

    fetchReport();
  }, [id]);

  const customMarker = new L.Icon({
    iconUrl: process.env.PUBLIC_URL + '/markers/map-marker-blue.png',
    shadowUrl: markerShadow,
    iconSize: [20, 35],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  if (!report) return <div>Loading report details...</div>;

  return (
    <>
      <Navbar />
      <div className="view-report-container">
        <h2>Damage Report Details</h2>
        <div className="report-card">
          <h3>Location Map</h3>
          {report.latitude && report.longitude ? (
            <MapContainer center={[report.latitude, report.longitude]} zoom={15} scrollWheelZoom={true} zoomControl={false} attributionControl={false} style={{ height: '300px', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              <Marker position={[report.latitude, report.longitude]} icon={customMarker}>
                <Popup><p>{report.Location}</p></Popup>
              </Marker>
            </MapContainer>
          ) : (
            <p>Location coordinates not available.</p>
          )}
          <button
            className="image-button1"
            onClick={() => {
              const viewUrl = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${report.imageId}/view?project=${PROJECT_ID}`;
              window.open(viewUrl, '_blank');
            }}
          >
            <td>View Image</td>
          </button>

          <button
            className="image-button2"
            onClick={() => {
              const viewUrl = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${report.processedImageId}/view?project=${PROJECT_ID}`;
              window.open(viewUrl, '_blank');
            }}
          >
            <td>View Detections</td>
          </button>

          <p><strong>Type:</strong> {report.Type}</p>
          <p><strong>Severity:</strong> {report.Severity}</p>
          <p><strong>Status:</strong> {report.Status}</p>
          <p><strong>Location:</strong> {report.Location}</p>
          <p><strong>Summary:</strong> {report.Summary}</p>


          <button className="btn" onClick={() => navigate(-1)}>Back to Dashboard</button>
        </div>
      </div>
    </>
  );
};

export default ViewReport;

