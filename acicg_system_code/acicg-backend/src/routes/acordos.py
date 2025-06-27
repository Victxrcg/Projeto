from flask import Blueprint, request, jsonify, send_file
from ..models.acicg import db, Acordo, Cliente, Divida, OpcaoNegociacao
from datetime import datetime
from flask import current_app
import io

acordos_bp = Blueprint('acordos', __name__)

# Helper para obter user_id autenticado (ajuste conforme seu sistema de auth)
def get_user_id():
    # Exemplo: user_id na sessão ou token
    return request.headers.get('X-User-Id') or 1  # mock para testes

@acordos_bp.route('/acordos', methods=['POST'])
def criar_acordo():
    data = request.json
    user_id = get_user_id()
    cliente = Cliente.query.filter_by(id=user_id).first()
    if not cliente:
        return jsonify({'error': 'Cliente não encontrado'}), 404
    acordo = Acordo(
        cliente_id=cliente.id,
        divida_id=data['divida_id'],
        opcao_negociacao_id=data['opcao_negociacao_id'],
        data_aceite=datetime.utcnow(),
        termo_aceito=data.get('termo_aceito', ''),
        status='ativo',
        parcelas=data.get('parcelas'),
        pdf_url=None
    )
    db.session.add(acordo)
    db.session.commit()
    return jsonify(acordo.to_dict()), 201

@acordos_bp.route('/acordos', methods=['GET'])
def listar_acordos():
    user_id = get_user_id()
    acordos = Acordo.query.filter_by(cliente_id=user_id).all()
    return jsonify([a.to_dict() for a in acordos])

@acordos_bp.route('/acordos/<int:acordo_id>/termo', methods=['GET'])
def baixar_termo(acordo_id):
    acordo = Acordo.query.get_or_404(acordo_id)
    # MOCK: gerar PDF fake em memória
    pdf_content = f"Termo do acordo #{acordo.id}\n\n{acordo.termo_aceito}".encode('utf-8')
    return send_file(
        io.BytesIO(pdf_content),
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'termo_acordo_{acordo.id}.pdf'
    )

@acordos_bp.route('/acordos/<int:acordo_id>', methods=['DELETE'])
def remover_acordo(acordo_id):
    acordo = Acordo.query.get_or_404(acordo_id)
    db.session.delete(acordo)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Acordo removido com sucesso'}) 