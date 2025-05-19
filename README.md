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

## Dataset Citation

This application uses the IMDB-Wiki dataset. If you use this application or the dataset, please cite:

```
@article{Rothe-IJCV-2018,
  author = {Rasmus Rothe and Radu Timofte and Luc Van Gool},
  title = {Deep expectation of real and apparent age from a single image without facial landmarks},
  journal = {International Journal of Computer Vision},
  volume={126},
  number={2-4},
  pages={144--157},
  year={2018},
  publisher={Springer}
}

@InProceedings{Rothe-ICCVW-2015,
  author = {Rasmus Rothe and Radu Timofte and Luc Van Gool},
  title = {DEX: Deep EXpectation of apparent age from a single image},
  booktitle = {IEEE International Conference on Computer Vision Workshops (ICCVW)},
  year = {2015},
  month = {December},
}
```

## License

Please note that this dataset is made available for academic research purposes only. All images are collected from the Internet, and the copyright belongs to the original owners. If any of the images belongs to you and you would like it removed, please kindly inform the dataset creators, and they will remove it from the dataset immediately.