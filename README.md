# IMDB-Wiki Viewer

A web-based viewer for the IMDB-Wiki face dataset with infinite scroll and search capabilities.

## Setup

1. Clone this repository:
   ```
   git clone https://github.com/thadius83/imdb-wiki-viewer.git
   cd imdb-wiki-viewer
   ```

2. Download the IMDB dataset:
   ```
   wget https://data.vision.ee.ethz.ch/cvl/rrothe/imdb-wiki/static/imdb_crop.tar
   ```

3. Extract it into the project directory:
   ```
   tar -xf imdb_crop.tar
   ```

4. Build and run with Docker:
   ```
   docker-compose build
   docker-compose up -d
   ```

5. Access the application at **http://localhost:5050**

## Features

- Browse celebrity images from the IMDB dataset
- Search by name
- Infinite scroll when browsing celebrity images
- View image metadata

## Technical Details

- Flask-based web server
- JavaScript frontend with infinite scroll
- Docker containerization for easy deployment