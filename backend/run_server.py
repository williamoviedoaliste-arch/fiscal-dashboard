#!/usr/bin/env python3
import os
from app import app

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5050))  # Usar 5050 por defecto (5000 ocupado por AirPlay)
    print(f"🚀 Starting Flask backend on port {port}...")
    print("📍 Endpoints disponibles:")
    print(f"   - http://localhost:{port}/api/metrics/monthly")
    print(f"   - http://localhost:{port}/api/metrics/sellers")
    print(f"   - http://localhost:{port}/api/pendings/summary")
    print(f"   - http://localhost:{port}/api/pendings/monthly")
    print(f"   - http://localhost:{port}/api/pendings/comparison")
    print("\n⚠️  Nota: Sin credenciales de BigQuery, los endpoints fallarán")
    print("   Esperando credenciales del service account de IT\n")

    app.run(debug=False, host='0.0.0.0', port=port, use_reloader=False)
