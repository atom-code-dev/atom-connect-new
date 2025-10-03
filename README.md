# Atom Connect API Documentation

## Overview

The Atom Connect API is a RESTful API built with Next.js 15, TypeScript, and Prisma ORM. It provides endpoints for managing trainers, organizations, training programs, and administrative functions. The API uses better-auth for authentication and authorization with role-based access control.

## Base URL

```
http://localhost:3000/api
```

## Authentication

The API uses better-auth for authentication with the following methods:

### 1. Email/Password Authentication
- **Endpoint**: `/api/auth/[...all]`
- **Methods**: GET, POST
- **Description**: Handles all authentication operations including sign-in, sign-out, and session management

### 2. LinkedIn OAuth
- **Endpoint**: `/api/auth/linkedin-callback`
- **Method**: GET
- **Description**: Handles LinkedIn OAuth callback and automatically assigns FREELANCER role

### Authentication Headers
All protected endpoints require authentication via session cookies. The API automatically validates sessions using better-auth.

## User Roles

The system supports four user roles with different access levels:

- **FREELANCER**: Trainers who can create profiles and apply for training programs
- **ORGANIZATION**: Companies that can post training programs and manage trainers
- **ADMIN**: System administrators with full access
- **MAINTAINER**: Users who review and approve training programs

---

## API Endpoints

### 1. Health Check

#### GET /api/health
**Description**: Check API health status

**Response**:
```json
{
  "message": "Good!"
}
```

---

### 2. Authentication Endpoints

#### POST /api/auth/sign-in/email
**Description**: Sign in with email and password

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "FREELANCER"
  },
  "session": {
    "token": "session_token",
    "expiresAt": "2024-12-31T23:59:59.999Z"
  }
}
```

#### GET /api/auth/sign-out
**Description**: Sign out current user

**Response**:
```json
{
  "success": true
}
```

#### GET /api/auth/linkedin-callback
**Description**: LinkedIn OAuth callback handler

**Query Parameters**:
- `code`: LinkedIn authorization code
- `state`: CSRF protection token

**Response**: Redirects to appropriate dashboard based on user profile

---

### 3. User Management

#### GET /api/users
**Description**: Get all users (Admin only)

**Authentication**: Required (ADMIN role)

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term for name/email

**Response**:
```json
{
  "users": [
    {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "FREELANCER",
      "freelancerProfile": {
        "id": "profile_id",
        "name": "Trainer Name",
        "skills": ["React", "Node.js"],
        "availability": "AVAILABLE"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

#### POST /api/users
**Description**: Create new user (Admin only)

**Authentication**: Required (ADMIN role)

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "phone": "+1234567890",
  "role": "FREELANCER"
}
```

**Response**:
```json
{
  "id": "new_user_id",
  "email": "newuser@example.com",
  "name": "New User",
  "role": "FREELANCER",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### PATCH /api/users
**Description**: Bulk operations on users (Admin only)

**Authentication**: Required (ADMIN role)

**Request Body**:
```json
{
  "userIds": ["user_id_1", "user_id_2"],
  "action": "activate|deactivate|delete"
}
```

**Response**:
```json
{
  "success": true,
  "message": "activate action completed"
}
```

---

### 4. Freelancer Management

#### GET /api/freelancers
**Description**: Get all freelancers with filtering and pagination

**Authentication**: Required

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term for name, skills, or experience
- `trainerType`: Filter by trainer type (UNIVERSITY, CORPORATE, BOTH)
- `availability`: Filter by availability status (AVAILABLE, IN_TRAINING, NOT_AVAILABLE)

**Response**:
```json
{
  "freelancers": [
    {
      "id": "freelancer_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "skills": ["React", "Node.js", "TypeScript"],
      "trainerType": "BOTH",
      "experience": "5+ years in web development",
      "linkedinProfile": "https://linkedin.com/in/johndoe",
      "availability": "AVAILABLE",
      "location": "New York",
      "user": {
        "id": "user_id",
        "email": "john@example.com",
        "role": "FREELANCER"
      },
      "trainings": [...],
      "feedbacks": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### PUT /api/freelancers
**Description**: Update freelancer profile (Freelancer only)

**Authentication**: Required (FREELANCER role)

**Request Body**:
```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "skills": ["React", "Node.js", "TypeScript"],
  "trainerType": "BOTH",
  "experience": "5+ years in web development",
  "linkedinProfile": "https://linkedin.com/in/johndoe",
  "cv": "/path/to/cv.pdf",
  "profilePicture": "/path/to/profile.jpg",
  "activity": "Conducting corporate training sessions",
  "availability": "AVAILABLE",
  "location": "New York"
}
```

**Response**:
```json
{
  "id": "freelancer_id",
  "name": "John Doe",
  "email": "john@example.com",
  "skills": ["React", "Node.js", "TypeScript"],
  "trainerType": "BOTH",
  "experience": "5+ years in web development",
  "availability": "AVAILABLE",
  "location": "New York",
  "user": {...},
  "trainings": [...],
  "feedbacks": [...]
}
```

#### PATCH /api/freelancers
**Description**: Bulk operations on freelancers (Admin/Maintainer only)

**Authentication**: Required (ADMIN or MAINTAINER role)

**Request Body**:
```json
{
  "freelancerIds": ["freelancer_id_1", "freelancer_id_2"],
  "action": "activate|deactivate|delete"
}
```

**Response**:
```json
{
  "success": true,
  "message": "activate action completed"
}
```

#### DELETE /api/freelancers?id={id}
**Description**: Delete freelancer (Admin only)

**Authentication**: Required (ADMIN role)

**Response**:
```json
{
  "success": true,
  "message": "Freelancer deleted successfully"
}
```

---

### 5. Organization Management

#### GET /api/organizations
**Description**: Get all organizations with filtering and pagination

**Authentication**: Required

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term for organization name, website, or location
- `verificationStatus`: Filter by verification status (PENDING, VERIFIED, REJECTED)
- `activeStatus`: Filter by active status (ACTIVE, INACTIVE)

**Response**:
```json
{
  "organizations": [
    {
      "id": "organization_id",
      "organizationName": "Tech Corp",
      "website": "https://techcorp.com",
      "contactMail": "contact@techcorp.com",
      "phone": "+1234567890",
      "companyLocation": "San Francisco, CA",
      "verifiedStatus": "VERIFIED",
      "activeStatus": "ACTIVE",
      "ratings": 4.5,
      "logo": "/path/to/logo.png",
      "user": {
        "id": "user_id",
        "email": "contact@techcorp.com",
        "role": "ORGANIZATION"
      },
      "trainings": [...],
      "feedbacks": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2
  }
}
```

#### POST /api/organizations
**Description**: Create new organization (Admin only)

**Authentication**: Required (ADMIN role)

**Request Body**:
```json
{
  "email": "org@example.com",
  "password": "password123",
  "name": "Organization Admin",
  "organizationName": "Tech Corp",
  "website": "https://techcorp.com",
  "contactMail": "contact@techcorp.com",
  "phone": "+1234567890",
  "companyLocation": "San Francisco, CA",
  "logo": "/path/to/logo.png"
}
```

**Response**:
```json
{
  "id": "organization_id",
  "organizationName": "Tech Corp",
  "contactMail": "contact@techcorp.com",
  "verifiedStatus": "PENDING",
  "activeStatus": "ACTIVE",
  "user": {
    "id": "user_id",
    "email": "org@example.com",
    "role": "ORGANIZATION"
  }
}
```

#### PUT /api/organizations
**Description**: Update organization profile (Organization only)

**Authentication**: Required (ORGANIZATION role)

**Request Body**:
```json
{
  "organizationName": "Tech Corp",
  "website": "https://techcorp.com",
  "contactMail": "contact@techcorp.com",
  "phone": "+1234567890",
  "companyLocation": "San Francisco, CA",
  "logo": "/path/to/logo.png"
}
```

**Response**:
```json
{
  "id": "organization_id",
  "organizationName": "Tech Corp",
  "contactMail": "contact@techcorp.com",
  "verifiedStatus": "VERIFIED",
  "activeStatus": "ACTIVE",
  "user": {...},
  "trainings": [...],
  "feedbacks": [...]
}
```

#### PATCH /api/organizations
**Description**: Bulk operations on organizations (Admin/Maintainer only)

**Authentication**: Required (ADMIN or MAINTAINER role)

**Request Body**:
```json
{
  "organizationIds": ["org_id_1", "org_id_2"],
  "action": "activate|deactivate|verify|unverify|delete"
}
```

**Response**:
```json
{
  "success": true,
  "message": "activate action completed"
}
```

#### DELETE /api/organizations?id={id}
**Description**: Delete organization (Admin only)

**Authentication**: Required (ADMIN role)

**Response**:
```json
{
  "success": true,
  "message": "Organization deleted successfully"
}
```

---

### 6. Training Management

#### GET /api/trainings
**Description**: Get all trainings with filtering and pagination

**Authentication**: Required

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term for title or description
- `category`: Filter by category name
- `type`: Filter by training type (CORPORATE, UNIVERSITY)

**Response**:
```json
{
  "trainings": [
    {
      "id": "training_id",
      "title": "React Advanced Training",
      "description": "Advanced React concepts and best practices",
      "skills": ["React", "JavaScript", "TypeScript"],
      "type": "CORPORATE",
      "companyName": "Tech Corp",
      "companyLogo": "/path/to/logo.png",
      "startDate": "2024-02-01T00:00:00.000Z",
      "endDate": "2024-02-05T00:00:00.000Z",
      "mode": "OFFLINE",
      "contractType": "PER_DAY",
      "experienceMin": 2,
      "experienceMax": 5,
      "openings": 3,
      "tfa": "AVAILABLE",
      "trainerPreference": "ALL_REGIONS",
      "hasPayment": true,
      "paymentTerm": 30,
      "paymentAmount": 500.00,
      "isPublished": true,
      "isActive": true,
      "category": {
        "id": "category_id",
        "name": "FRAMEWORKS"
      },
      "location": {
        "id": "location_id",
        "state": "California",
        "district": "San Francisco"
      },
      "stack": {
        "id": "stack_id",
        "name": "React"
      },
      "organization": {
        "id": "organization_id",
        "organizationName": "Tech Corp"
      },
      "freelancer": {
        "id": "freelancer_id",
        "name": "John Doe"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 20,
    "pages": 2
  }
}
```

#### POST /api/trainings
**Description**: Create new training (Admin/Organization only)

**Authentication**: Required (ADMIN or ORGANIZATION role)

**Request Body**:
```json
{
  "title": "React Advanced Training",
  "description": "Advanced React concepts and best practices",
  "skills": ["React", "JavaScript", "TypeScript"],
  "categoryId": "category_id",
  "type": "CORPORATE",
  "locationId": "location_id",
  "stackId": "stack_id",
  "mode": "OFFLINE",
  "contractType": "PER_DAY",
  "experienceMin": 2,
  "experienceMax": 5,
  "openings": 3,
  "tfa": "AVAILABLE",
  "trainerPreference": "ALL_REGIONS",
  "startDate": "2024-02-01",
  "endDate": "2024-02-05",
  "hasPayment": true,
  "paymentTerm": 30,
  "paymentAmount": 500.00
}
```

**Response**:
```json
{
  "id": "training_id",
  "title": "React Advanced Training",
  "description": "Advanced React concepts and best practices",
  "type": "CORPORATE",
  "companyName": "Tech Corp",
  "startDate": "2024-02-01T00:00:00.000Z",
  "endDate": "2024-02-05T00:00:00.000Z",
  "isPublished": false,
  "isActive": true,
  "category": {...},
  "location": {...},
  "stack": {...},
  "organization": {...}
}
```

#### PATCH /api/trainings
**Description**: Bulk operations on trainings (Admin/Maintainer only)

**Authentication**: Required (ADMIN or MAINTAINER role)

**Request Body**:
```json
{
  "trainingIds": ["training_id_1", "training_id_2"],
  "action": "activate|deactivate|publish|unpublish|delete|approve|reject"
}
```

**Response**:
```json
{
  "success": true,
  "message": "activate action completed"
}
```

#### DELETE /api/trainings?id={id}
**Description**: Delete training (Admin/Organization only)

**Authentication**: Required (ADMIN or ORGANIZATION role)

**Response**:
```json
{
  "success": true,
  "message": "Training deleted successfully"
}
```

---

### 7. Maintainer Management

#### GET /api/maintainers
**Description**: Get all maintainers (Admin only)

**Authentication**: Required (ADMIN role)

**Query Parameters**:
- `search`: Search term for name or email

**Response**:
```json
{
  "id": "maintainer_id",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "MAINTAINER",
  "maintainerProfile": {
    "id": "profile_id",
    "status": "ACTIVE"
  },
  "reviewsCount": 15,
  "approvedTrainings": 25,
  "rejectedTrainings": 3
}
```

#### POST /api/maintainers
**Description**: Create new maintainer (Admin only)

**Authentication**: Required (ADMIN role)

**Request Body**:
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "password": "password123"
}
```

**Response**:
```json
{
  "id": "maintainer_id",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "MAINTAINER",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### PATCH /api/maintainers
**Description**: Bulk operations on maintainers (Admin only)

**Authentication**: Required (ADMIN role)

**Request Body**:
```json
{
  "ids": ["maintainer_id_1", "maintainer_id_2"],
  "action": "activate|deactivate|delete"
}
```

**Response**:
```json
{
  "message": "Successfully activated 2 maintainers",
  "count": 2
}
```

---

### 8. Stack Management

#### GET /api/stacks
**Description**: Get all stacks (Admin only)

**Authentication**: Required (ADMIN role)

**Query Parameters**:
- `search`: Search term for name or description

**Response**:
```json
{
  "id": "stack_id",
  "name": "React",
  "description": "React JavaScript library",
  "trainings": [
    {
      "id": "training_id",
      "title": "React Basics",
      "isActive": true
    }
  ],
  "trainingsCount": 5,
  "activeTrainingsCount": 3
}
```

#### POST /api/stacks
**Description**: Create new stack (Admin only)

**Authentication**: Required (ADMIN role)

**Request Body**:
```json
{
  "name": "React",
  "description": "React JavaScript library"
}
```

**Response**:
```json
{
  "id": "stack_id",
  "name": "React",
  "description": "React JavaScript library",
  "trainingsCount": 0,
  "activeTrainingsCount": 0
}
```

#### PUT /api/stacks
**Description**: Update stack (Admin only)

**Authentication**: Required (ADMIN role)

**Request Body**:
```json
{
  "id": "stack_id",
  "name": "React",
  "description": "React JavaScript library for building user interfaces"
}
```

**Response**:
```json
{
  "id": "stack_id",
  "name": "React",
  "description": "React JavaScript library for building user interfaces",
  "trainingsCount": 5,
  "activeTrainingsCount": 3
}
```

#### PATCH /api/stacks
**Description**: Bulk operations on stacks (Admin only)

**Authentication**: Required (ADMIN role)

**Request Body**:
```json
{
  "stackIds": ["stack_id_1", "stack_id_2"],
  "action": "delete"
}
```

**Response**:
```json
{
  "success": true,
  "message": "delete action completed"
}
```

#### DELETE /api/stacks?id={id}
**Description**: Delete stack (Admin only)

**Authentication**: Required (ADMIN role)

**Response**:
```json
{
  "success": true,
  "message": "Stack deleted successfully"
}
```

---

### 9. Admin Dashboard

#### GET /api/admin/dashboard/stats
**Description**: Get dashboard statistics (Admin only)

**Authentication**: Required (ADMIN role)

**Response**:
```json
{
  "stats": {
    "totalUsers": 150,
    "totalOrganizations": 25,
    "totalFreelancers": 100,
    "totalMaintainers": 5,
    "totalTrainings": 75,
    "activeTrainings": 30,
    "pendingVerifications": 12
  },
  "recentActivities": [
    {
      "id": "user_id",
      "type": "freelancer",
      "action": "New freelancer registered",
      "time": "2024-01-01 12:00:00",
      "userName": "John Doe"
    }
  ]
}
```

---

### 10. Additional Endpoints

#### GET /api/training-categories
**Description**: Get all training categories

**Authentication**: Required

**Response**:
```json
[
  {
    "id": "category_id",
    "name": "FRAMEWORKS",
    "description": "Framework-based training"
  }
]
```

#### GET /api/training-locations
**Description**: Get all training locations

**Authentication**: Required

**Response**:
```json
[
  {
    "id": "location_id",
    "state": "California",
    "district": "San Francisco",
    "isActive": true
  }
]
```

#### POST /api/training-categories/bulk-import
**Description**: Bulk import training categories (Admin only)

**Authentication**: Required (ADMIN role)

**Request Body**:
```json
{
  "categories": [
    {
      "name": "NEW_CATEGORY",
      "description": "New category description"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "imported": 1,
  "errors": []
}
```

---

## Error Responses

All endpoints return standardized error responses:

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error"
}
```

---

## Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  password?: string;
  name?: string;
  phone?: string;
  emailVerified: boolean;
  role: UserRole;
  createdAt: DateTime;
  updatedAt: DateTime;
  linkedinId?: string;
  linkedinAccessToken?: string;
  linkedinRefreshToken?: string;
  freelancerProfile?: FreelancerProfile;
  organizationProfile?: OrganizationProfile;
  adminProfile?: AdminProfile;
  maintainerProfile?: MaintainerProfile;
}
```

### FreelancerProfile
```typescript
interface FreelancerProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  skills?: string; // JSON array
  trainerType: TrainerType;
  experience: string;
  linkedinProfile?: string;
  cv?: string;
  profilePicture?: string;
  activity?: string;
  availability: AvailabilityStatus;
  location?: string;
  createdAt: DateTime;
  updatedAt: DateTime;
  trainings: Training[];
  feedbacks: TrainingFeedback[];
}
```

### OrganizationProfile
```typescript
interface OrganizationProfile {
  id: string;
  userId: string;
  organizationName: string;
  website?: string;
  contactMail: string;
  phone?: string;
  verifiedStatus: VerificationStatus;
  companyLocation: string;
  activeStatus: ActiveStatus;
  ratings: number;
  logo?: string;
  createdAt: DateTime;
  updatedAt: DateTime;
  trainings: Training[];
  feedbacks: TrainingFeedback[];
}
```

### Training
```typescript
interface Training {
  id: string;
  title: string;
  description: string;
  skills?: string; // JSON array
  categoryId: string;
  type: TrainingType;
  locationId: string;
  stackId: string;
  companyName: string;
  companyLogo?: string;
  startDate: DateTime;
  endDate: DateTime;
  mode: TrainingMode;
  contractType: ContractType;
  experienceMin?: number;
  experienceMax?: number;
  openings: number;
  tfa: TFAStatus;
  trainerPreference: TrainerPreference;
  hasPayment: boolean;
  paymentTerm?: number;
  paymentAmount?: number;
  isPublished: boolean;
  isActive: boolean;
  organizationId: string;
  freelancerId?: string;
  createdAt: DateTime;
  updatedAt: DateTime;
  category: TrainingCategory;
  location: TrainingLocation;
  stack: Stack;
  organization: OrganizationProfile;
  freelancer?: FreelancerProfile;
  feedbacks: TrainingFeedback[];
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse. Current limits:
- **Authenticated requests**: 100 requests per minute
- **Unauthenticated requests**: 10 requests per minute

---

## Best Practices

1. **Authentication**: Always include authentication headers for protected endpoints
2. **Error Handling**: Implement proper error handling for all API responses
3. **Pagination**: Use pagination for large datasets to improve performance
4. **Validation**: Validate all input data before making API requests
5. **Role-based Access**: Ensure users have appropriate roles for specific operations
6. **Bulk Operations**: Use bulk operations for multiple updates to reduce API calls

---

## Testing

Use the following curl commands to test key endpoints:

### Health Check
```bash
curl http://localhost:3000/api/health
```

### User Login
```bash
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Get Freelancers (with auth)
```bash
curl http://localhost:3000/api/freelancers \
  -H "Cookie: session_token=your_session_token"
```

### Create Training (with auth)
```bash
curl -X POST http://localhost:3000/api/trainings \
  -H "Content-Type: application/json" \
  -H "Cookie: session_token=your_session_token" \
  -d '{
    "title": "Test Training",
    "description": "Test description",
    "categoryId": "category_id",
    "type": "CORPORATE",
    "locationId": "location_id",
    "stackId": "stack_id",
    "startDate": "2024-02-01",
    "endDate": "2024-02-05",
    "openings": 1
  }'
```

---

## Environment Variables

The API requires the following environment variables:

```env
DATABASE_URL="postgresql://username:password@host:port/database"
AUTH_SECRET="your_auth_secret"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_key"
LINKEDIN_CLIENT_ID="your_linkedin_client_id"
LINKEDIN_CLIENT_SECRET="your_linkedin_client_secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Getting Started

1. **Install Dependencies**
```bash
npm install
```

2. **Set Up Environment Variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Run Database Migrations**
```bash
npm run db:push
```

4. **Start Development Server**
```bash
npm run dev
```

5. **Access API Documentation**
The API will be available at `http://localhost:3000/api`

---

This comprehensive API documentation covers all endpoints, authentication methods, data models, and best practices for the Atom Connect application. The API provides a robust foundation for managing trainers, organizations, and training programs with proper role-based access control and security measures.