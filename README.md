# Wallora - Wall Customization App

A modern web application for creating and customizing image walls with drag-and-drop functionality, filters, frames, and export capabilities.

## Project Structure

```
wall-Customizer/
├── frontend/                 # Next.js Frontend Application
│   ├── app/                  # Next.js 13+ App Router
│   │   ├── page.tsx         # Landing page (redirects to /create or /login)
│   │   ├── create/
│   │   │   └── page.tsx     # Wall creation form
│   │   ├── editor/
│   │   │   └── page.tsx     # Wall editor/customizer
│   │   ├── login/
│   │   │   └── page.tsx     # User login
│   │   ├── register/
│   │   │   └── page.tsx     # User registration
│   │   └── profile/
│   │       └── page.tsx     # User profile management
│   ├── components/
│   │   ├── wall/            # Wall-related components
│   │   │   ├── WallCreator.tsx
│   │   │   └── WallEditor.tsx
│   │   ├── auth/            # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProfileForm.tsx
│   │   ├── ui/              # Reusable UI components (shadcn/ui)
│   │   └── shared/          # Shared components
│   ├── lib/
│   │   ├── constants.ts     # App constants
│   │   └── utils.ts         # Utility functions
│   └── public/              # Static assets
│       ├── samples/         # Sample images
│       └── walls/           # Wall backgrounds
└── backend/                 # Node.js/Express Backend
    ├── server/
    │   ├── index.js         # Main server file
    │   ├── db.js            # Database connection
    │   └── routes/
    │       └── auth.js      # Authentication routes
    └── package.json         # Backend dependencies
```

## Features

### Frontend Features
- **Wall Creation**: Set wall dimensions, background, and color
- **Image Management**: Upload, drag, resize, and position images
- **Image Editing**: Apply filters, shapes, frames, and borders
- **Collage Creation**: Combine multiple images into collages
- **Export Options**: Export as PNG, JPG, or PDF
- **User Authentication**: Login, registration, and profile management
- **Responsive Design**: Works on desktop and mobile devices

### Backend Features
- **User Authentication**: Register, login, and password management
- **MySQL Database**: User data storage
- **RESTful API**: Clean API endpoints
- **Security**: Password verification and validation

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MySQL database
- npm or yarn

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up your MySQL database:
```sql
CREATE DATABASE wallora_db;
```

4. Configure environment variables (optional):
```bash
# Create .env file
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=wallora_db
```

5. Start the backend server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/update-password` - Update user password
- `POST /api/auth/verify-password` - Verify current password

### Health Check
- `GET /api/health` - Server health status

## Component Architecture

### Wall Components
- **WallCreator**: Handles wall setup and configuration
- **WallEditor**: Main wall editing interface with image management

### Authentication Components
- **LoginForm**: User login with email/password
- **RegisterForm**: User registration with validation
- **ProfileForm**: Profile management and password changes

### Shared Components
- **Wall**: Renders the wall background and container
- **ImageBlock**: Individual image with drag/resize functionality
- **ImageEditor**: Sidebar for image editing tools
- **WallSettings**: Dialog for wall configuration
- **ExportDialog**: Export options and functionality

## State Management

The application uses React's built-in state management:
- **Local State**: Component-specific state using `useState`
- **LocalStorage**: Persists wall settings and user authentication
- **Props**: Data flow between parent and child components

## File Organization Benefits

### Separation of Concerns
- **Frontend/Backend**: Clear separation between client and server code
- **Component-Based**: Reusable components organized by functionality
- **Route-Based**: Each page has its own directory and component

### Maintainability
- **Modular Components**: Easy to update and maintain individual features
- **Clear Structure**: Intuitive file organization
- **Type Safety**: TypeScript interfaces for better development experience

### Scalability
- **Extensible Architecture**: Easy to add new features and components
- **API-First Design**: Backend ready for additional endpoints
- **Component Reusability**: Shared components across different pages

## Development Workflow

1. **Frontend Development**: Work in the `frontend/` directory
2. **Backend Development**: Work in the `backend/` directory
3. **Database Changes**: Update `backend/server/db.js` for schema changes
4. **New Features**: Create new components in appropriate directories
5. **Testing**: Test both frontend and backend independently

## Deployment

### Frontend Deployment
- Build the Next.js app: `npm run build`
- Deploy to Vercel, Netlify, or any static hosting service

### Backend Deployment
- Set up environment variables for production
- Deploy to Heroku, Railway, or any Node.js hosting service
- Configure MySQL database connection

## Contributing

1. Follow the established file structure
2. Create components in appropriate directories
3. Use TypeScript for better type safety
4. Test both frontend and backend functionality
5. Update documentation for new features

## License

This project is licensed under the ISC License. 