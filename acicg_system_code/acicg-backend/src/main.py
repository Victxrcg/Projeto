import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.acicg import db
from src.routes.auth import auth_bp
from src.routes.dividas import dividas_bp
from src.routes.boletos import boletos_bp
from src.routes.acordos import acordos_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'acicg_secret_key_2025'
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_DOMAIN'] = '10.100.20.241'

# Habilitar CORS para permitir comunicação com o frontend
CORS(
    app,
    supports_credentials=True,
    origins=[
        "https://wlrijmew.manus.space/#",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://10.100.20.241:5173"
    ]
)

# Registrar blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(dividas_bp, url_prefix='/api')
app.register_blueprint(boletos_bp, url_prefix='/api')
app.register_blueprint(acordos_bp, url_prefix='/api')

# Configuração do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Criar tabelas e popular com dados de exemplo
with app.app_context():
    db.create_all()
    
    # Importar e executar seed data
    from src.utils.seed_data import criar_dados_exemplo
    criar_dados_exemplo()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint para verificar se a API está funcionando"""
    return {
        'success': True,
        'message': 'API ACICG funcionando corretamente',
        'version': '1.0.0'
    }

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
