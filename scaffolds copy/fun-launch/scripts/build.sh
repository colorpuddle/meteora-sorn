#!/bin/bash

# Cloudflare Pages build script
echo "Installing dependencies..."
npm install

echo "Building the application..."
npm run build

echo "Build completed successfully!"
