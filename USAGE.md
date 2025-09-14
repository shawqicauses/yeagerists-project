<!-- REVIEWED -->

# Usage Guide

This guide explains how to use and test the Yeagerists Project after setup.

## Overview

The Yeagerists Project is a blockchain-based certificate management system that allows:

- **Issuers** to create and issue digital certificates
- **Accredited Users** to receive, view, and manage certificates
- **Verifiers** to verify certificate authenticity

## Getting Started

### 1. Access the Application

After running `pnpm dev`, navigate to:

- **Main Application**: `http://localhost:3000`
- **Admin Panel**: `http://localhost:3000/admin`

### 2. User Registration

#### Sign Up Process

1. Go to `/sign-up` or click "Sign up" from the main page
2. Select your role:
   - **Issuer**: Can create and issue certificates
   - **Accredited User**: Can receive and manage certificates
3. Fill in your details:
   - Name (varies based on role)
   - Email address
   - Password
4. Click "Sign up"

#### Role Selection

- **Issuer**: Enter your organization/issuer name
- **Accredited User**: Enter your full name

### 3. User Authentication

#### Sign In

1. Go to `/sign-in`
2. Enter your email and password
3. Click "Sign in"

## User Roles and Features

### Issuer Dashboard (`/dashboard/signer`)

**Certificate Management:**

- Create new certificates
- Issue certificates to accredited users
- View all issued certificates
- Download certificate PDFs

**Key Features:**

- Certificate form with recipient details
- Digital signature generation
- Blockchain integration for verification
- Certificate status tracking

### Accredited User Dashboard (`/dashboard`)

**Certificate Management:**

- View received certificates
- Download certificate PDFs
- Track certificate status
- Manage personal profile

**Key Features:**

- Certificate gallery view
- Search and filter certificates
- Profile management
- Certificate verification status

### Verifier Dashboard (`/dashboard/verifier`)

**Verification Tools:**

- Upload certificates for verification
- Verify certificate authenticity
- View verification results
- Check blockchain records

**Key Features:**

- File upload interface
- Real-time verification
- Detailed verification reports
- Blockchain transaction lookup

## Testing the Application

### 1. Basic User Flow Testing

#### Test Issuer Workflow:

1. **Register as Issuer**

   - Sign up with role "Issuer"
   - Use test data: `issuer@example.com`

2. **Create Certificate**

   - Navigate to `/dashboard/signer`
   - Fill out certificate form
   - Issue certificate to a test user

3. **Verify Certificate**
   - Use the verifier dashboard
   - Upload the issued certificate
   - Confirm verification success

#### Test Accredited User Workflow:

1. **Register as Accredited User**

   - Sign up with role "Accredited User"
   - Use test data: `user@example.com`

2. **Receive Certificate**
   - Check dashboard for issued certificates
   - Download certificate PDF
   - Verify certificate details

### 2. Advanced Testing Scenarios

#### Blockchain Integration Testing:

1. **Certificate Issuance**

   - Create multiple certificates
   - Verify blockchain transactions
   - Check certificate hashes

2. **Verification Process**
   - Test with valid certificates
   - Test with tampered certificates
   - Verify error handling

#### Security Testing:

1. **Authentication**

   - Test invalid credentials
   - Test session management
   - Test role-based access

2. **Data Integrity**
   - Verify certificate immutability
   - Test blockchain verification
   - Check data validation

### 3. Admin Panel Testing

#### Access Admin Panel:

1. Navigate to `/admin`
2. Use admin credentials (if configured)
3. Test collection management

#### Admin Features:

- User management
- Certificate oversight
- System configuration
- Data export/import

## Sample Test Data

### Test Users:

```
Issuer:
- Email: issuer@example.com
- Password: Test-Password@1234!
- Name: Test Issuer Organization

Accredited User:
- Email: user@example.com
- Password: Test-Password@1234!
- Name: John Doe
```

### Test Certificates:

- Course completion certificates
- Professional certifications
- Training completion records
- Achievement certificates

## Common Use Cases

### 1. Educational Institution

- Issue course completion certificates
- Verify student achievements
- Track academic progress

### 2. Professional Training

- Issue training completion certificates
- Verify professional development
- Maintain training records

### 3. Corporate Certification

- Issue employee certifications
- Verify skill assessments
- Track professional development

## Troubleshooting

### Common Issues:

1. **Certificate Upload Fails**

   - Check file format (PDF recommended)
   - Verify file size limits
   - Ensure proper permissions

2. **Verification Errors**

   - Check blockchain connectivity
   - Verify certificate integrity
   - Confirm certificate format

3. **Authentication Issues**
   - Clear browser cache
   - Check session expiration
   - Verify user credentials

### Performance Testing:

- Test with multiple concurrent users
- Verify blockchain transaction speed
- Check file upload/download performance
- Monitor database query performance

## Best Practices

### For Issuers:

- Use clear, descriptive certificate names
- Include all necessary recipient details
- Verify recipient information before issuing
- Keep backup records of issued certificates

### For Accredited Users:

- Regularly check for new certificates
- Download and backup important certificates
- Verify certificate authenticity when needed
- Keep profile information updated

### For Verifiers:

- Always verify certificate authenticity
- Check blockchain records for tampering
- Report suspicious certificates
- Maintain verification logs

## Support

For technical support or questions:

1. Check the console for error messages
2. Review the troubleshooting section
3. Verify all setup requirements are met
4. Check environment configuration
