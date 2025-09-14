<!-- REVIEWED -->

# Setup Instructions

This guide will help you install dependencies and run the Yeagerists Project locally.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.JS** (version 18 or higher)
- **pnpm** (recommended package manager)
- **PostgreSQL** database
- **Git**

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/shawqicauses/yeagerists-project
cd yeagerists-project
```

### 2. Install Dependencies

```bash
pnpm install
```

In case `pnpm` is not installed on your system, you can install it globally:

```bash
npm install -g pnpm
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URI = postgresql://username:password@localhost:5432/yeagerists_db

# Payload CMS Configuration
PAYLOAD_SECRET = your-secret-key-here

# Vercel Blob Storage (for file uploads)
BLOB_READ_WRITE_TOKEN = your-vercel-blob-token

# Next.JS Configuration
NEXT_PUBLIC_APP_URL = http://localhost:3000
```

### 4. Database Setup

1. Create a PostgreSQL database named `yeagerists_db` (or your preferred name)
2. Update the `DATABASE_URI` in your `.env.local` file with your database credentials

### 5. Generate TypeScript Types

```bash
pnpm payload:types
```

### 6. Run Database Migrations

```bash
pnpm payload:migrate
```

## Running the Project

### Development Mode

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

### Alternative Development Commands

- **HTTPS Development**: `pnpm dev:https`
- **Turbo Mode**: `pnpm dev:turbo` (faster builds)

### Production Build

```bash
pnpm build
pnpm start
```

## Additional Commands

- **Formatting**: `pnpm format`
- **Linting**: `pnpm lint`
- **Migration Status**: `pnpm payload:migrate:status`
- **Create Migration**: `pnpm payload:migrate:create`

## Troubleshooting

### Common Issues

1. **Database Connection Issues**

   - Ensure PostgreSQL is running
   - Verify database credentials in `.env.local`
   - Check if the database exists

2. **Port Already in Use**

   - Change the port in `package.json` scripts or use `-p 3001` flag

3. **TypeScript Errors**

   - Run `pnpm payload:types` to regenerate types
   - Ensure all dependencies are installed

4. **Environment Variables**
   - Double-check all required environment variables are set
   - Restart the development server after changing `.env.local`

### Getting Help

For issues not covered here:

1. Check the console for error messages
2. Verify all prerequisites are installed
3. Ensure environment variables are correctly configured
4. Try deleting `node_modules` and running `pnpm install` again

## Project Structure

- `/src/app` - Next.JS app router pages and layouts
- `/src/components` - Reusable UI components
- `/src/collections` - Payload CMS collections
- `/src/lib` - Utility functions and configurations
- `/src/actions` - Server actions
- `/src/hooks` - Custom React hooks
