# ShieldFlow // AI-Powered Credit Card Fraud Analytics

ShieldFlow is a modern, responsive, full-stack transaction evaluation system. It takes credit card transaction parameters, processes them into high-dimensional indicators, and feeds them into a Random Forest machine learning classifier to instantly determine the risk profile of a transaction.

The project is adapted from a Jupyter Notebook model setup into a service-oriented, modular React web application.

---

## 🔗 Project Resources & Notebooks

* **Live Web Application (GitHub Pages)**: [https://volderbeek.github.io/Credit-Card-Fraud-Detection/](https://volderbeek.github.io/Credit-Card-Fraud-Detection/)
* **Model Generation**: The machine learning model is trained inside the Jupyter notebook and exported to ONNX format (`model.onnx`).

---

## 🛠️ Technology Stack

* **Backend Service**: Python 3.11/3.13, Flask API, Flask-CORS (Cross-Origin Resource Sharing), Gunicorn (production WSGI server)
* **ML Inference Engine**: ONNX Runtime (`onnxruntime` 1.x), NumPy (high-performance execution, lightweight 4.1MB model footprint, fast loading and prediction without pandas or scikit-learn dependencies)
* **Data Science & ML Training**: Scikit-Learn 1.9.0 (Random Forest Classifier), Pandas 3.0.3, NumPy 2.5.0 (used in Jupyter Notebook modeling environment)
* **Frontend Client**: React 19, Vite 8 (Hot-Module Replacement), Vanilla CSS3 (Custom styling, animations, conic-gradients)

---

## 📂 Project Structure

```text
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow for deploying frontend to Pages
├── backend/
│   ├── Dockerfile              # Container specification for Cloud Run deployment
│   ├── app.py                  # Flask server containing ONNX model loader & prediction API
│   ├── deploy.sh               # Bash script for deployment to Google Cloud Run
│   ├── deploy.ps1              # PowerShell script for deployment to Google Cloud Run
│   ├── environment.yml         # Conda backend environment configuration
│   └── requirements.txt        # Python backend requirements (Flask, ONNX Runtime, etc.)
├── frontend/
│   ├── src/
│   │   ├── components/         # Modular React components
│   │   │   ├── Header.jsx      # Dashboard header & health-check status indicator
│   │   │   ├── Presets.jsx     # Calibrated test scenarios
│   │   │   ├── ScanForm.jsx    # Input fields, custom slider, dropdown validation
│   │   │   └── ScanResults.jsx # Radar sweep loader, conic risk gauges, and report breakdown
│   │   ├── App.jsx             # React app controller and API connector
│   │   ├── App.css             # Glassmorphic themes, responsive layout, animations
│   │   ├── index.css           # Styling tokens and CSS design system variables
│   │   └── main.jsx            # React root mount
│   ├── index.html              # HTML shell & font definitions
│   ├── vite.config.js          # Vite build configuration (base path configured for relative URLs)
│   └── package.json            # Node project configuration
├── model.onnx                  # Serialized ONNX Random Forest classifier (~4.1MB)
├── environment.yml             # Conda notebook/modeling environment configuration
└── README.md                   # Main documentation (this file)
```

---

## 🚀 Quick Start Instructions

Follow these instructions to run the application locally on your machine.

> [!IMPORTANT]
> Make sure the model file `model.onnx` is present in the root of the project directory before starting the backend server.

### 1. Setup Environments

You can configure the python environments using either **Conda** or **Pip**.

#### Option A: Conda (Recommended to prevent version mismatches)
* **For Jupyter Notebook modeling**:
  ```bash
  conda env create -f environment.yml
  conda activate fraud-detection-notebook
  ```
* **For the Flask Backend server**:
  ```bash
  conda env create -f backend/environment.yml
  conda activate fraud-detection-backend
  ```

#### Option B: Pip
* **For the Flask Backend**:
  ```bash
  pip install -r backend/requirements.txt
  ```

### 2. Launch the Backend Server
Start the Flask API server (ensure your environment is active):
```bash
python backend/app.py
```
*The backend server will run in debug mode at [http://127.0.0.1:5000/](http://127.0.0.1:5000/).*

### 3. Launch the Frontend Server
Open another terminal in the `frontend/` directory:
```bash
# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```
*The React application will launch at [http://localhost:5173/](http://localhost:5173/).*

---

## 📊 Feature Mapping & Computations

ShieldFlow maps React form inputs into the 22 features required by the Random Forest model:

1. **Amount (`amt`)**: Floating-point transaction amount in USD.
2. **Night (`night`)**: Binary integer flag. Evaluates to `1` (Late Night) if transaction hour is $< 4$ (before 4 AM) or $> 21$ (after 9 PM), otherwise `0`.
3. **Transactions in last 30 days (`last_30_days`)**: An integer indicator representing card activity frequency.
4. **Time (`hour`)**: Hour value ($0 - 23$) from the slider component.
5. **Month (`month`)**: Extracted as the integer month ($1 - 12$) from the transaction date.
6. **Age (`age`)**: Customer age ($18 - 120$) entered in the form.
7. **Weekend (`weekend`)**: Binary integer flag. Evaluates to `1` if the transaction day is Monday (0) or Sunday (6) as defined in the training notebook preprocessing, otherwise `0`.
8. **Zip Code (`zip`)**: The 5-digit zip code.
9. **Category One-Hot Flags**: 14 categories (from index `0` to `13`) are expanded into binary values where the selected category is marked `1` and all others are `0`.

---

## 🎭 Simulation Profiles

To help test and demonstrate the model's decision boundaries, the UI provides four calibrated presets:

* **Safe Lunch Dining** 🍔: A low-value ($15.50) restaurant meal during noon hours. Yields **~8% fraud probability** (Low Risk).
* **Safe Gym Membership** 💪: A standard fitness payment ($29.99) at noon. Yields **~5% fraud probability** (Low Risk).
* **Suspicious Midnight Online** 🚨: A card-not-present internet shopping transaction ($950.00) at 11 PM. Yields **~95% fraud probability** (High Risk).
* **Suspicious Late Night Gas** ⚠️: A gas station transaction ($22.00) at 3 AM. Yields **~90% fraud probability** (High Risk).

---

## 🌐 Deployment to Google Cloud Run

The backend service is configured to be containerized and deployed to **Google Cloud Run** using Google Cloud Build. 

### Prerequisites
1. Install the [Google Cloud SDK (gcloud CLI)](https://cloud.google.com/sdk/docs/install).
2. Ensure you have a Google Cloud Project with the **Cloud Run API** and **Cloud Build API** enabled.

### Deploying the Backend
We have provided automated scripts to handle the deployment. The build context is automatically set to the repository root so the Docker container can package `model.onnx`, while ignoring unnecessary files like frontend node dependencies and large raw CSV files via `.dockerignore`.

#### Option A: Bash (Linux / macOS / Git Bash on Windows)
Run the deploy script from the root or `backend/` directory:
```bash
chmod +x backend/deploy.sh
./backend/deploy.sh
```

#### Option B: PowerShell (Windows)
Run the deploy script in PowerShell:
```powershell
.\backend\deploy.ps1
```

### Configuration (Optional Environment Variables)
You can customize the deployment by setting environment variables before running the scripts:
- `GCP_PROJECT_ID`: Override or set the active GCP Project.
- `GCP_SERVICE_NAME`: The name of the deployed service (default: `fraud-detection-backend`).
- `GCP_REGION`: The GCP region to deploy to (default: `us-central1`).

### Verifying the Deployment
Once deployed, the script will output the Service URL (e.g., `https://fraud-detection-backend-xxxxxx.a.run.app`). 
1. Open your browser and navigate to the health check endpoint: `https://<service-url>/api/health`.
2. It should return a success JSON response confirming the model loaded correctly:
   ```json
   {
     "model_loaded": true,
     "status": "healthy"
   }
   ```
3. Update the frontend `App.jsx` API configuration to point to this new Cloud Run URL instead of `localhost:5000`.

---

## 🌐 Frontend Deployment to GitHub Pages

The React frontend is set up with an automated deployment pipeline to **GitHub Pages**.

### How It Works
* The repository contains a GitHub Actions workflow located in `.github/workflows/deploy.yml`.
* On every code push to the `main` or `master` branch, the workflow will automatically:
  1. Checkout the source code.
  2. Install Node.js dependencies using `npm ci`.
  3. Build the frontend client with `npm run build` (under `frontend/dist`).
  4. Upload the built static files as a Pages artifact.
  5. Deploy the artifact to the GitHub Pages environment.

### Configuration & Activation
1. Go to your repository settings on GitHub.
2. Navigate to **Pages** (under the Code and automation section).
3. Under **Build and deployment**, select **GitHub Actions** as the Source (instead of deploying from a branch).
4. The workflow will run and host your site at your custom GitHub Pages URL (e.g., `https://<username>.github.io/<repo-name>/`).


