<img src="enhancements.png" alt="Alt Text" width="500">
<img src="output.png" alt="Alt Text" width="500">

---

# 📸 AI-Based Image Colorizer Tool

This repository provides an AI-powered tool for colorizing black-and-white images. The project consists of two parts:  
1. **DeOldify-Based Image Colorization (Main Project)** – Uses pretrained models from the DeOldify repository. This model is **not fine-tuned on any specific dataset**.  
2. **TensorFlow-Based Image Colorization (Optional Project)** – A model trained and **fine-tuned on the CelebA dataset** using TensorFlow.  

---

## 🔍 Overview
This tool provides a simple web interface where users can upload grayscale images and receive colored versions using pretrained AI models.  

---

## 🎥 Demo Video
Watch the tool in action: [UI Demo Video](https://drive.google.com/file/d/1tP5CZUBO9Zp05jtLaMjJ9YtiG9E2fI45/view?usp=drive_link)  

---

## 📁 Project Structure
```
├── DeOldify (Clone this repository separately)
│   ├── deoldify
│   ├── models
│   │   └── ColorizeArtistic_gen.pth (Download and place here)
│   └── other files...
├── Colorizer_UI (This repository)
│   ├── app.py
│   ├── requirements.txt
│   ├── static
│   ├── templates
│   ├── uploads
```

---

## 🚀 Installation and Setup (DeOldify-Based Image Colorization - Main Project)
### 1. Clone Repositories  
- Clone the original DeOldify repository from its official source: [DeOldify Repo](https://github.com/jantic/DeOldify.git).  
- Clone **this repository (Colorizer_UI)** separately and move its contents into the folder where you cloned **DeOldify**.  

### 2. Download Model Weights  
Download the model weights from [this link](https://drive.google.com/drive/folders/1IzMW89QmwGB8F5Bn8kCdni9GhM-VoN22?usp=sharing).  

Place the downloaded weights in:  
```
DeOldify/models/
```

### 3. Modify Path in `app.py`  
In your `app.py`, update the `sys.path.append` line to point to the `DeOldify` folder location,change this to your path.  
```python
sys.path.append('C:/Users/dell/Desktop/Colorizer/DeOldify')
```

### 4. Create Virtual Environment  
Create a virtual environment and install dependencies:  
```bash
python3.9 -m venv venv
source venv/bin/activate     # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

### 5. Run the Application  
Start the Flask server by running:  
```bash
python app.py
```
Access the app at the URL displayed in the terminal (usually `http://127.0.0.1:5000/`).

---

## 💡 Using the App (Main Project)
1. **Upload a Black-and-White Photo.**  
2. **Select Model Type:** Choose between Artistic or Stable models.  
3. **Adjust Render Factor:** Don't go beyond 35 as higher values may consume more memory.  
4. **Click Submit and View the Result!**  

---

## 🌟 Optional: TensorFlow-Based Model (CelebA Dataset - Fine-Tuned)
This part of the project is trained separately on the CelebA dataset and can be run using the provided `try.ipynb` file.  

### Model Weights  
Download the model weights from [this link](https://drive.google.com/drive/folders/1IzMW89QmwGB8F5Bn8kCdni9GhM-VoN22?usp=sharing).  

### Dataset  
CelebA: [CelebA Dataset](https://www.kaggle.com/datasets/sampat05/colors)  

### Requirements  
- Python: 3.10.16  
- TensorFlow: 2.10.0  

Install dependencies:  
```bash
pip install tensorflow==2.10.0
```

---

## 📌 Important Notes
- **Main Project (DeOldify Model)**: This model is a general-purpose model **not fine-tuned on any specific dataset** but performs well on most images.  
- **Optional Project (TensorFlow Model)**: This model is fine-tuned on the **CelebA dataset**, providing better results specifically for human faces.  
- Ensure that the DeOldify repo and this repository are placed properly as described above.  
- Make sure your Python environment matches the version requirements mentioned.  
- The `render_factor` should not exceed 35 to avoid heavy memory consumption.  

--- 
