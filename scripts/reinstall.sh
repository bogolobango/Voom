#!/bin/bash
cd /vercel/share/v0-project
rm -rf node_modules
npm install --legacy-peer-deps
echo "Dependencies installed successfully"
