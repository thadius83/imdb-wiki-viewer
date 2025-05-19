import os
import pandas as pd
import numpy as np
import json
import math
from flask import Flask, render_template, request, jsonify, send_from_directory
from functools import lru_cache

# Custom JSON encoder to handle NaN, NaT, Infinity and other non-JSON serializable values
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, float):
            if np.isnan(obj):
                return None
            if np.isinf(obj):
                return None
        if pd.isna(obj):
            return None
        return super().default(obj)

app = Flask(__name__)
app.json_encoder = CustomJSONEncoder

# Configuration
CSV_PATH = '../meta.csv'  # Path to the metadata CSV file - fallback to simpler version if full version not available
IMAGE_DIR = '../imdb_crop'  # Path to the image directory

# Check if the full version exists and use it if available
if os.path.exists('../imdb_meta_full.csv'):
    CSV_PATH = '../imdb_meta_full.csv'

# Load the data with caching
@lru_cache(maxsize=1)
def load_data():
    try:
        df = pd.read_csv(CSV_PATH)
        return df
    except Exception as e:
        print(f"Error loading data: {e}")
        return pd.DataFrame()

# Get unique celebrity names from the dataset
def get_unique_names():
    df = load_data()
    # Get unique non-null names and sort alphabetically
    names = df['name'].dropna().unique().tolist()
    return sorted(names)

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/unique-names')
def unique_names():
    try:
        names = get_unique_names()
        return jsonify({
            'names': names,
            'count': len(names)
        })
    except Exception as e:
        print(f"Error getting unique names: {e}")
        return jsonify({
            'error': str(e),
            'names': [],
            'count': 0
        }), 500

@app.route('/api/data')
def get_data():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        search = request.args.get('search', '').strip()
        
        df = load_data()
        
        # Apply search filter if provided
        if search:
            # Make search case-insensitive and handle NaN values
            mask = df['name'].fillna('').str.lower().str.contains(search.lower())
            df = df[mask]
        
        # Calculate pagination
        start = (page - 1) * limit
        end = start + limit
        
        # Safety check on dataframe size
        if start >= len(df):
            start = 0
            end = min(limit, len(df))
        
        # Get paginated data and handle problematic values
        df_page = df.iloc[start:end].copy()
        
        # Replace problematic values
        replacements = {
            np.nan: None,
            np.inf: None,
            -np.inf: None
        }
        
        # Apply replacements to all fields that could have issues
        for col in df_page.select_dtypes(include=['float', 'int']).columns:
            df_page[col] = df_page[col].replace(replacements)
        
        # Convert to records (serializable format)
        data = df_page.to_dict(orient='records')
        total = len(df)
        
        return jsonify({
            'data': data,
            'total': total,
            'page': page,
            'limit': limit
        })
    except Exception as e:
        # Log the error and return a meaningful error response
        print(f"Error in get_data: {str(e)}")
        return jsonify({
            'error': str(e),
            'data': [],
            'total': 0,
            'page': 1,
            'limit': 20
        }), 500

@app.route('/api/image/<path:image_path>')
def get_image_path(image_path):
    # Return the full path or handle errors
    full_path = os.path.join(IMAGE_DIR, image_path)
    if os.path.exists(full_path):
        return jsonify({'exists': True, 'path': image_path})
    else:
        return jsonify({'exists': False})

# Route to serve images directly
@app.route('/images/<path:filename>')
def serve_image(filename):
    # The filename might have a path like "imdb_crop/01/nm0000001_rm946909184_1899-5-10_1968.jpg"
    # We need to extract the proper path components for send_from_directory
    
    # If the path starts with the image directory, strip it for correct serving
    if filename.startswith(IMAGE_DIR + '/'):
        path = filename[len(IMAGE_DIR)+1:]
        return send_from_directory(IMAGE_DIR, path)
    
    # Otherwise try to serve from the parent directory
    return send_from_directory('..', filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
