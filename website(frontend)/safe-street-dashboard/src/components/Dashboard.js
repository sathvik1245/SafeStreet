
import React, { useEffect, useState, useContext } from 'react';
import './Dashboard.css';
import Navbar from './Navbar';
import MapComponent from './MapComponent';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { client, account, databases } from './appwriteConfig';
import { getDamageReports } from './appwriteApi';
import { useNavigate } from 'react-router-dom';
import { storage } from './appwriteConfig';
import L from 'leaflet';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { ThemeContext } from '../ThemeContext';

// Environment variables for Appwrite configuration
const DATABASE_ID = process.env.REACT_APP_APPWRITE_DATABASE_ID;
const COLLECTION_ID = process.env.REACT_APP_APPWRITE_COLLECTION_ID;
const BUCKET_ID = process.env.REACT_APP_APPWRITE_BUCKET_ID;
const PROJECT_ID = process.env.REACT_APP_APPWRITE_PROJECT_ID;
const ENDPOINT = process.env.REACT_APP_APPWRITE_ENDPOINT;

const Dashboard = () => {
  const navigate = useNavigate();
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editRowId, setEditRowId] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState('');

  const getAddressFromCoords = async (lat, lon) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
      const data = await response.json();
      return data.display_name;
    } catch (error) {
      console.error("Failed to get address:", error);
      return null;
    }
  };

  const updateLocationInDatabase = async (documentId, newLocation) => {
    try {
      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, documentId, {
        Location: newLocation
      });
    } catch (error) {
      console.error("Failed to update location:", error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowNavbar(currentScrollY <= lastScrollY);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const [reports, setReports] = useState([]);
  const totalReports = reports.length;
  const pendingCount = reports.filter(r => r.Status === 'Pending').length;
  const inProgressCount = reports.filter(r => r.Status === 'in_progress').length;
  const resolvedCount = reports.filter(r => r.Status === 'Resolved').length;
  const rejectedCount = reports.filter(r => r.Status === 'Rejected').length;

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getDamageReports();
        setReports(data);
        data.forEach(async (report) => {
          if (report.latitude && report.longitude && !report.Location) {
            const address = await getAddressFromCoords(report.latitude, report.longitude);
            if (address) {
              await updateLocationInDatabase(report.$id, address);
            }
          }
        });
      } catch (error) {
        console.error("Failed to fetch reports", error);
      }
    };
    fetchReports();
  }, []);

  const filteredReports = reports.filter((report) => {
    const matchesSeverity = filterSeverity ? report.Severity === filterSeverity : true;
    const matchesStatus = filterStatus ? report.Status === filterStatus : true;
    return matchesSeverity && matchesStatus;
  });

  const handleStatusUpdate = async (reportId) => {
    try {
      const statusToStore = updatedStatus === 'In Progress' ? 'in_progress' : updatedStatus;
      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, reportId, { Status: statusToStore });
      const refreshedReports = await getDamageReports();
      setReports(refreshedReports);
      setEditRowId(null);
    } catch (error) {
      alert('Error updating status.');
    }
  };

  const customMarker = new L.Icon({
    iconUrl: process.env.PUBLIC_URL + '/markers/map-marker-blue.png',
    shadowUrl: markerShadow,
    iconSize: [20, 35],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const [showSummary, setShowSummary] = useState(false);
  const [currentSummary, setCurrentSummary] = useState('');
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    document.documentElement.style.setProperty('--background', theme.background);
    document.documentElement.style.setProperty('--text', theme.text);
    document.documentElement.style.setProperty('--primary', theme.primary);
    document.documentElement.style.setProperty('--card', theme.card);
    document.documentElement.style.setProperty('--buttonText', theme.buttonText);
    document.documentElement.style.setProperty('--tableHeader', theme.tableHeader);
    document.documentElement.style.setProperty('--btnColour', theme.btnColour);
  }, [theme]);

  return (
    <>
      <Navbar hidden={!showNavbar} />

      <div className="dashboard">
        <h1 className="title">Safe Street Admin Dashboard</h1>

        <div className="dashboard-grid">

          <div className="card overview">
            <h2>Overview</h2>
            <div className="summary">
              <div>Total Reports: <strong>{totalReports}</strong></div>
              <div>Pending: <strong>{pendingCount}</strong></div>
              <div>In Progress: <strong>{inProgressCount}</strong></div>
              <div>Resolved: <strong>{resolvedCount}</strong></div>
              <div>Rejected: <strong>{rejectedCount}</strong></div>
            </div>
          </div>

          <div className="card filters">
            <h2>Filters</h2>
            <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
              <option value="">All Severities</option>
              <option value="3">Low(1)</option>
              <option value="2">Medium(2)</option>
              <option value="1">High(3)</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="card map">
            <h2>Damage Map</h2>
            <MapContainer center={[17.399534, 78.499570]} zoom={13} scrollWheelZoom zoomControl={false} attributionControl={false} style={{ height: '300px', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
              {reports.filter(r => r.latitude && r.longitude).map(report => (
                <Marker key={report.$id} position={[report.latitude, report.longitude]} icon={customMarker}>
                  <Popup>
                    <strong>{report.Type || 'Unknown'}</strong><br />
                    Severity: {report.Severity || 'N/A'}<br />
                    <button className="btn btn-small" onClick={() => window.open(`${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${report.imageId}/view?project=${PROJECT_ID}`, '_blank')}>View Image</button>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="card reports" style={{ gridColumn: '1 / -1' }}>
            <h2>Reported Damages</h2>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Image</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Summary</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th style={{ width: '160px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.reverse().map((report) => (
                  <tr key={report.$id}>
                    <td className="actions" style={{ textAlign: 'center' }}>
                      {report.imageId ? (
                        <button className="image-button" onClick={() => window.open(`${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${report.imageId}/view?project=${PROJECT_ID}`, '_blank')}>
                          <img src={`${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${report.imageId}/view?project=${PROJECT_ID}`} alt="Damage Preview" width="50" height="auto" />
                        </button>
                      ) : 'No Image'}
                    </td>
                    <td>{report.Type || 'Unknown'}</td>
                    <td>{report.Severity || 'N/A'}</td>
                    <td>
                      <button className="btn-btn-small" onClick={() => { setCurrentSummary(report.Summary || 'No summary provided'); setShowSummary(true); }}>View Summary</button>
                    </td>
                    <td>{report.Location || 'N/A'}</td>
                    <td>
                      {editRowId === report.$id ? (
                        <select value={updatedStatus} onChange={(e) => setUpdatedStatus(e.target.value)}>
                          <option value="Pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      ) : (
                        report.Status === 'in_progress' ? 'In Progress' : report.Status || 'Pending'
                      )}
                    </td>
                    <td className="actions" style={{ textAlign: 'center' }}>
                      <button className="btn" onClick={() => navigate(`/report/${report.$id}`)}>View</button>
                      {editRowId === report.$id ? (
                        <>
                          <button className="btn btn-success" onClick={() => handleStatusUpdate(report.$id)}>Save</button>
                          <button className="btn btn-secondary" onClick={() => setEditRowId(null)}>Cancel</button>
                        </>
                      ) : (
                        <button className="btn btn-secondary" onClick={() => { setEditRowId(report.$id); setUpdatedStatus(report.Status === 'in_progress' ? 'in_progress' : report.Status || 'Pending'); }}>Edit</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={`modal-overlay ${showSummary ? 'show' : ''}`}>
              <div className="modal-content">
                <h3>Summary</h3>
                <p>{currentSummary}</p>
                <button className="btn" onClick={() => setShowSummary(false)}>Close</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;
