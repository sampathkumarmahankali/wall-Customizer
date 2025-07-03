#!/bin/bash

# Migration script to reorganize the Wallora project structure
# This script will help move existing files to the new frontend/backend structure

echo "🚀 Starting Wallora project structure migration..."

# Create new directory structure
echo "📁 Creating new directory structure..."

# Create frontend directory
mkdir -p frontend/app/{create,editor,login,register,profile}
mkdir -p frontend/components/{wall,auth,shared}
mkdir -p frontend/lib
mkdir -p frontend/public/{samples,walls}

# Create backend directory
mkdir -p backend/server/routes

echo "✅ Directory structure created"

# Move existing files to frontend
echo "📦 Moving files to frontend..."

# Move app files
if [ -f "app/page.tsx" ]; then
    cp app/page.tsx frontend/app/page.tsx
    echo "  ✅ Moved app/page.tsx"
fi

if [ -d "app/login" ]; then
    cp -r app/login/* frontend/app/login/
    echo "  ✅ Moved app/login/"
fi

if [ -d "app/register" ]; then
    cp -r app/register/* frontend/app/register/
    echo "  ✅ Moved app/register/"
fi

if [ -d "app/profile" ]; then
    cp -r app/profile/* frontend/app/profile/
    echo "  ✅ Moved app/profile/"
fi

# Move components
if [ -d "components" ]; then
    cp -r components/* frontend/components/
    echo "  ✅ Moved components/"
fi

# Move lib
if [ -d "lib" ]; then
    cp -r lib/* frontend/lib/
    echo "  ✅ Moved lib/"
fi

# Move public files
if [ -d "public" ]; then
    cp -r public/* frontend/public/
    echo "  ✅ Moved public/"
fi

# Move configuration files
if [ -f "package.json" ]; then
    cp package.json frontend/package.json
    echo "  ✅ Moved package.json"
fi

if [ -f "package-lock.json" ]; then
    cp package-lock.json frontend/package-lock.json
    echo "  ✅ Moved package-lock.json"
fi

if [ -f "pnpm-lock.yaml" ]; then
    cp pnpm-lock.yaml frontend/pnpm-lock.yaml
    echo "  ✅ Moved pnpm-lock.yaml"
fi

if [ -f "next.config.mjs" ]; then
    cp next.config.mjs frontend/next.config.mjs
    echo "  ✅ Moved next.config.mjs"
fi

if [ -f "tailwind.config.ts" ]; then
    cp tailwind.config.ts frontend/tailwind.config.ts
    echo "  ✅ Moved tailwind.config.ts"
fi

if [ -f "tsconfig.json" ]; then
    cp tsconfig.json frontend/tsconfig.json
    echo "  ✅ Moved tsconfig.json"
fi

if [ -f "postcss.config.mjs" ]; then
    cp postcss.config.mjs frontend/postcss.config.mjs
    echo "  ✅ Moved postcss.config.mjs"
fi

if [ -f "components.json" ]; then
    cp components.json frontend/components.json
    echo "  ✅ Moved components.json"
fi

# Move styles
if [ -d "styles" ]; then
    cp -r styles/* frontend/styles/
    echo "  ✅ Moved styles/"
fi

if [ -f "app/globals.css" ]; then
    cp app/globals.css frontend/app/globals.css
    echo "  ✅ Moved app/globals.css"
fi

# Move backend files
echo "📦 Moving files to backend..."

if [ -d "server" ]; then
    cp -r server/* backend/server/
    echo "  ✅ Moved server/"
fi

if [ -f "server/package.json" ]; then
    cp server/package.json backend/package.json
    echo "  ✅ Moved server/package.json"
fi

if [ -f "server/package-lock.json" ]; then
    cp server/package-lock.json backend/package-lock.json
    echo "  ✅ Moved server/package-lock.json"
fi

echo "✅ File migration completed!"

# Create backup of original structure
echo "💾 Creating backup of original structure..."
mkdir -p backup
cp -r app backup/ 2>/dev/null || true
cp -r components backup/ 2>/dev/null || true
cp -r lib backup/ 2>/dev/null || true
cp -r public backup/ 2>/dev/null || true
cp -r server backup/ 2>/dev/null || true
cp -r styles backup/ 2>/dev/null || true
cp package.json backup/ 2>/dev/null || true
cp package-lock.json backup/ 2>/dev/null || true
cp pnpm-lock.yaml backup/ 2>/dev/null || true
cp next.config.mjs backup/ 2>/dev/null || true
cp tailwind.config.ts backup/ 2>/dev/null || true
cp tsconfig.json backup/ 2>/dev/null || true
cp postcss.config.mjs backup/ 2>/dev/null || true
cp components.json backup/ 2>/dev/null || true
echo "  ✅ Backup created in backup/ directory"

echo ""
echo "🎉 Migration completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Review the new structure in frontend/ and backend/ directories"
echo "2. Test the application by running:"
echo "   - Frontend: cd frontend && npm run dev"
echo "   - Backend: cd backend && npm run dev"
echo "3. Update any import paths if needed"
echo "4. Remove the backup/ directory once you're satisfied"
echo ""
echo "📚 Check the README.md file for detailed setup instructions"
echo ""
echo "⚠️  Note: The original files are backed up in the backup/ directory"
echo "   You can safely delete them once you've verified everything works" 