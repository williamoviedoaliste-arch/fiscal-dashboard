#!/usr/bin/env python3
from app import app

if __name__ == '__main__':
    print("🚀 Starting Flask backend on port 5000...")
    print("📍 Endpoints disponibles:")
    print("   - http://localhost:5000/api/metrics/monthly")
    print("   - http://localhost:5000/api/metrics/sellers")
    print("   - http://localhost:5000/api/pendings/summary")
    print("   - http://localhost:5000/api/pendings/monthly")
    print("   - http://localhost:5000/api/pendings/comparison")
    print("\n⚠️  Nota: Sin credenciales de BigQuery, los endpoints fallarán")
    print("   Esperando credenciales del service account de IT\n")

    app.run(debug=False, host='0.0.0.0', port=5000, use_reloader=False)
