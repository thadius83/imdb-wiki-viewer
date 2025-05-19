#!/bin/bash
set -e

cd /workspace/imdb

# Check if the metadata files already exist
if [ ! -f "meta.csv" ] || [ ! -f "imdb_meta_full.csv" ]; then
  echo "Processing IMDB dataset to create metadata files..."
  # Run the processing script
  python3 mat_expanded.py
else
  echo "Metadata files already exist, skipping processing step"
fi

# Change to web directory to run the app
cd web
python3 app.py