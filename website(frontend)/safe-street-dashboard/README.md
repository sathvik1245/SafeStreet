# Safe Street Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive web-based admin dashboard for managing and monitoring road damage reports submitted through the Safe Street mobile application. This dashboard provides real-time visualization, status management, and detailed analytics of infrastructure damage reports.

## Features

- **Real-time Dashboard**: View all damage reports with filtering by severity and status
- **Interactive Map**: Visualize damage locations on an interactive map with markers
- **Report Management**: Update report statuses (Pending, In Progress, Resolved, Rejected)
- **Image Viewing**: View original and AI-processed damage images
- **Location Services**: Automatic address resolution from GPS coordinates
- **Statistics Overview**: Track total reports, pending, in-progress, resolved, and rejected counts
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Dark/Light Theme**: Toggle between dark and light themes for comfortable viewing

## Technology Stack

- **Frontend Framework**: React 18.2
- **Routing**: React Router DOM 7.6
- **Backend Service**: Appwrite (BaaS)
- **Maps**: React Leaflet 4.2 with OpenStreetMap
- **Icons**: React Icons 5.5
- **Styling**: CSS3 with custom theme system
- **Build Tool**: Create React App

## Prerequisites

Before running this project, ensure you have:

- Node.js (v14 or higher)
- npm or yarn package manager
- An Appwrite account and project set up
- Appwrite database and storage bucket configured

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd safe-street-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory by copying the example file:
   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and add your Appwrite credentials:
   ```env
   REACT_APP_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
   REACT_APP_APPWRITE_PROJECT_ID=your_project_id_here
   REACT_APP_APPWRITE_DATABASE_ID=your_database_id_here
   REACT_APP_APPWRITE_COLLECTION_ID=your_collection_id_here
   REACT_APP_APPWRITE_BUCKET_ID=your_bucket_id_here
   ```

   > **Note**: Never commit your `.env` file to version control. It contains sensitive credentials.

## Running the Application

### Development Mode

Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

### Production Build

Create an optimized production build:
```bash
npm run build
```

The build files will be generated in the `build/` directory.

## Project Structure

```
safe-street-dashboard/
├── public/               # Static assets
│   └── markers/         # Map marker icons
├── src/
│   ├── components/      # React components
│   │   ├── Dashboard.js       # Main dashboard view
│   │   ├── Login.js           # Authentication
│   │   ├── Profile.js         # User profile
│   │   ├── ViewReport.js      # Detailed report view
│   │   ├── Navbar.js          # Navigation bar
│   │   ├── MapComponent.js    # Map integration
│   │   ├── appwriteConfig.js  # Appwrite client setup
│   │   └── appwriteApi.js     # API functions
│   ├── AuthContext.js   # Authentication context
│   ├── ThemeContext.js  # Theme management
│   ├── App.js           # Main app component
│   └── index.js         # Entry point
├── .env.example         # Environment variables template
├── .gitignore          # Git ignore rules
└── package.json        # Dependencies and scripts
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_APPWRITE_ENDPOINT` | Appwrite API endpoint | `https://fra.cloud.appwrite.io/v1` |
| `REACT_APP_APPWRITE_PROJECT_ID` | Your Appwrite project ID | `abc123...` |
| `REACT_APP_APPWRITE_DATABASE_ID` | Database ID for reports | `def456...` |
| `REACT_APP_APPWRITE_COLLECTION_ID` | Collection ID for damage reports | `ghi789...` |
| `REACT_APP_APPWRITE_BUCKET_ID` | Storage bucket ID for images | `jkl012...` |

## Available Scripts

- `npm start` - Run development server
- `npm run build` - Create production build
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App (one-way operation)

## Features in Detail

### Dashboard Overview
- Real-time statistics of all reports
- Filter reports by severity (Low, Medium, High)
- Filter reports by status (Pending, In Progress, Resolved, Rejected)

### Report Management
- View detailed information for each report
- Update report status inline
- View original and AI-processed images
- Automatic location resolution from GPS coordinates

### Map Visualization
- Interactive map showing all damage locations
- Click markers to view report details
- Quick access to damage images from map popups

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues or questions, please open an issue in the repository.
