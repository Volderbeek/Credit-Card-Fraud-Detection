import os
import numpy as np
import onnxruntime as ort
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests from the React frontend

# Resolve the absolute path to the model file
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.abspath(os.path.join(current_dir, '..', 'model.onnx'))

print(f"Loading ONNX model from {model_path}...")
try:
    # Load the ONNX model using CPUExecutionProvider
    model = ort.InferenceSession(model_path, providers=['CPUExecutionProvider'])
    print("ONNX model loaded successfully!")
except Exception as e:
    print(f"Error loading ONNX model: {e}")
    model = None

# Exact features used during model training
COLUMNS = [
    'amt', 'night', 'last_30_days', 'hour', 'month', 'age', 'weekend', 'zip',
    'category_entertainment', 'category_food_dining', 'category_gas_transport',
    'category_grocery_net', 'category_grocery_pos', 'category_health_fitness',
    'category_home', 'category_kids_pets', 'category_misc_net',
    'category_misc_pos', 'category_personal_care', 'category_shopping_net',
    'category_shopping_pos', 'category_travel'
]

@app.route('/api/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded on server. Check logs.'}), 500
    
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No input data provided'}), 400
        
        # Extract inputs with defaults
        amount = float(data.get('amount', 13.37))
        time_hour = int(data.get('time', 12))  # Hour (0-23)
        date_str = data.get('date', datetime.today().strftime('%Y-%m-%d'))
        category_idx = int(data.get('category', 0))  # 0 to 13
        age = int(data.get('age', 30))
        last_30_days = int(data.get('last_30_days', 10))
        zip_code = int(data.get('zip', 90210))
        
        # Calculate features based on notebook logic
        # 1. Night feature: time < 4 or time > 21
        night = int(time_hour < 4 or time_hour > 21)
        
        # 2. Parse date
        dt_obj = datetime.strptime(date_str, '%Y-%m-%d')
        month = dt_obj.month
        
        # 3. Weekend feature: notebook uses date.value.weekday() == 0 or date.value.weekday() == 6
        # weekday() in Python returns 0 for Monday and 6 for Sunday.
        weekday = dt_obj.weekday()
        weekend = int(weekday == 0 or weekday == 6)
        
        # 4. Categories (14 one-hot columns)
        cat_one_hot = [0] * 14
        if 0 <= category_idx < 14:
            cat_one_hot[category_idx] = 1
        else:
            return jsonify({'error': f'Category index must be between 0 and 13. Got {category_idx}'}), 400
        
        # Reconstruct the feature row in exact column order
        row = [
            amount,
            night,
            last_30_days,
            time_hour,
            month,
            age,
            weekend,
            zip_code
        ] + cat_one_hot
        
        # Format input for ONNX (shape: [1, 22], type: float32)
        input_data = np.array([row], dtype=np.float32)
        
        # Get inputs and outputs from ONNX model session
        input_name = model.get_inputs()[0].name
        label_name = model.get_outputs()[0].name
        probabilities_name = model.get_outputs()[1].name
        
        # Run prediction
        preds = model.run([label_name, probabilities_name], {input_name: input_data})
        
        # Parse probabilities from the predicted output.
        # Note: Under ONNX TreeEnsembleClassifier binary classification with post_transform=NONE,
        # class 0 probability is sometimes returned as -p_1 instead of 1-p_1 due to operator specification.
        # To be robust, we read the positive class probability (class 1) and calculate the negative class (class 0) as 1 - p_1.
        probs = preds[1]
        if isinstance(probs, np.ndarray):
            fraud_prob = max(0.0, min(1.0, float(probs[0, 1])))
        elif isinstance(probs, (list, tuple)):
            # Fallback for alternative or un-narrowed type representations (e.g. list of dicts for ZipMap)
            fraud_prob = max(0.0, min(1.0, float(probs[0][1])))
        else:
            # Fallback/unexpected type representation
            fraud_prob = 0.0
        legitimate_prob = 1.0 - fraud_prob
        
        # A simple risk classification
        risk_level = 'Low'
        if fraud_prob > 0.5:
            risk_level = 'High'
        elif fraud_prob > 0.15:
            risk_level = 'Medium'
            
        return jsonify({
            'legitimate_probability': legitimate_prob,
            'fraud_probability': fraud_prob,
            'is_fraud': fraud_prob > 0.5,
            'risk_level': risk_level,
            'features_processed': {
                'amount': amount,
                'time_hour': time_hour,
                'night': bool(night),
                'month': month,
                'age': age,
                'weekend': bool(weekend),
                'zip_code': zip_code,
                'category_idx': category_idx
            }
        })
        
    except ValueError as ve:
        return jsonify({'error': f'Invalid value type: {str(ve)}'}), 400
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Server prediction error: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
