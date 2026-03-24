# SafeStreet

A React Native mobile application for reporting and tracking road damage using AI-powered image detection. SafeStreet helps communities identify and document infrastructure issues to improve road safety.

## 🚀 Features

- **AI-Powered Detection**: Uses ONNX Runtime to detect and classify road damage from images
- **Camera Integration**: Take photos directly in-app or upload from gallery
- **Location Tagging**: Automatically tag damage reports with GPS coordinates
- **User Authentication**: Secure login and registration with Appwrite
- **Cross-Platform**: Built with Expo for iOS and Android support
- **Interactive Maps**: View reported road damage on an interactive map

## 🛠️ Technology Stack

- **Framework**: React Native with Expo
- **Routing**: Expo Router
- **Backend**: Appwrite (Authentication, Database, Storage)
- **AI/ML**: ONNX Runtime for React Native
- **Maps**: React Native Maps
- **State Management**: React Context API

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- An Appwrite account and project ([Sign up here](https://cloud.appwrite.io/))

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/safestreet.git
cd safestreet/Client-Side
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Appwrite

1. Create an account at [Appwrite Cloud](https://cloud.appwrite.io/)
2. Create a new project
3. Copy your project credentials
4. Update `lib/appwrite.js` with your credentials:

```javascript
export const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('YOUR_PROJECT_ID_HERE')
    .setPlatform('YOUR_PLATFORM_BUNDLE_ID');
```

Alternatively, you can use environment variables (see `.env.example`).

### 4. Update App Configuration

Edit `app.json` to customize:
- App name and slug
- Android package name
- EAS project ID (if using Expo Application Services)

### 5. Run the Application

```bash
# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

## 📁 Project Structure

```
Client-Side/
├── app/                    # App screens and routing
│   ├── (auth)/            # Authentication screens
│   ├── (dashboard)/       # Main app screens
│   └── _layout.jsx        # Root layout
├── components/            # Reusable UI components
├── contexts/              # React Context providers
├── lib/                   # Configuration and utilities
│   └── appwrite.js       # Appwrite client setup
├── assets/               # Images, icons, and static files
├── constants/            # App constants and theme
└── hooks/                # Custom React hooks
```

## 🔐 Environment Variables

Create a `.env` file based on `.env.example`:

```env
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id_here
APPWRITE_PLATFORM=your_platform_bundle_id
```

## 📱 Permissions

The app requires the following permissions:
- **Camera**: To capture photos of road damage
- **Photo Library**: To upload existing images
- **Location**: To tag damage reports with GPS coordinates

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Backend powered by [Appwrite](https://appwrite.io/)
- AI detection using [ONNX Runtime](https://onnxruntime.ai/)

## 📞 Support

For issues and questions, please open an issue on GitHub.
