# IMDB Dataset Explorer

A lightweight web application for exploring the IMDB facial dataset and matching images with their metadata.

## Features

- Browse through IMDB celebrity images
- View detailed metadata for each image (name, age, gender, DOB, etc.)
- Search by celebrity name
- Simple pagination to navigate through the dataset

## Setup and Running

1. Make sure the CSV data is generated first:
   ```
   cd /workspace/imdb
   python mat_expanded.py
   ```

2. Start the web application:
   ```
   cd /workspace/imdb/web
   python app.py
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

## Notes

- The application looks for the metadata CSV file at `../imdb_meta_full.csv` relative to the app.py file
- Images are served from the `../imdb_crop` directory
- For a full-screen placeholder image, create a file at `/static/placeholder.jpg`

## Customization

You can easily customize this application by:
- Adjusting the number of images per page (modify the `pageSize` variable in app.js)
- Changing the styling (modify style.css)
- Adding additional filters for the dataset
