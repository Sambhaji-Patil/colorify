from flask import Flask, render_template, request, redirect, url_for, jsonify
import os
from pathlib import Path
from PIL import Image, ImageEnhance
import matplotlib.pyplot as plt
import sys
import uuid
import base64
import re
sys.path.append('C:/Users/dell/Desktop/Colorizer_rapsody/DeOldify')
from deoldify.visualize import get_image_colorizer

app = Flask(__name__, static_folder='static')

# Create necessary directories
os.makedirs('./uploads', exist_ok=True)
os.makedirs('./static/results', exist_ok=True)
os.makedirs('./static/enhanced', exist_ok=True)

# Define model paths and settings
root_folder = Path(r"C:\Users\dell\Desktop\Colorizer_rapsody\DeOldify")
artistic_model = get_image_colorizer(root_folder=root_folder, artistic=True)
stable_model = get_image_colorizer(root_folder=root_folder, artistic=False)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/colorize', methods=['POST'])
def colorize():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    image = request.files['image']
    model_type = request.form.get('model')
    render_factor = int(request.form.get('render_factor', 35))

    # Generate a unique filename
    filename = f"{uuid.uuid4()}.{image.filename.split('.')[-1]}"
    image_path = f'./uploads/{filename}'
    image.save(image_path)

    # Select model
    colorizer = artistic_model if model_type == 'artistic' else stable_model

    # Colorize the image
    results_dir = Path('./static/results')
    result_path = colorizer.plot_transformed_image(path=image_path, results_dir=results_dir, render_factor=render_factor)
    
    # Return the URL to the colorized image
    result_url = f'/static/results/{os.path.basename(result_path)}'
    return jsonify({'success': True, 'image_url': result_url})

@app.route('/save_enhanced', methods=['POST'])
def save_enhanced():
    if 'enhanced_image' not in request.files:
        return jsonify({'error': 'No enhanced image provided'}), 400
    
    enhanced_image = request.files['enhanced_image']
    
    # Generate a unique filename
    filename = f"enhanced_{uuid.uuid4()}.jpg"
    file_path = f'./static/enhanced/{filename}'
    
    # Save the enhanced image
    enhanced_image.save(file_path)
    
    # Return the public URL
    # In a production environment, this would be a full URL to your server
    # For local development, we'll use a relative path
    image_url = f'/static/enhanced/{filename}'
    
    # Get the full URL (for production)
    # You would replace this with your actual domain in production
    host = request.host_url.rstrip('/')
    full_url = f"{host}{image_url}"
    
    return jsonify({'success': True, 'image_url': full_url})

if __name__ == '__main__':
    app.run(debug=True)

