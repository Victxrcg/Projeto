from flask import Blueprint, request, jsonify, session
from src.models.acicg import db, Cliente, Divida, OpcaoNegociacao
from functools import wraps

dividas_bp = Blueprint('dividas', __name__)


def login_required(f):
    """Decorator para verificar se o usuário está logado"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'cliente_id' not in session:
            return jsonify({
                'success': False,
                'message': 'Login necessário'
            }), 401
        return f(*args, **kwargs)
    return decorated_function

@dividas_bp.route('/dividas', methods=['GET'])
@login_required
def get_dividas():
    """Listar todas as dívidas do cliente logado"""
    try:
        cliente_id = session['cliente_id']
        
        dividas = Divida.query.filter_by(
            cliente_id=cliente_id,
            status='pendente'
        ).all()
        
        dividas_data = []
        for divida in dividas:
            divida_dict = divida.to_dict()
            divida_dict['cliente'] = {
                'matricula': divida.cliente.matricula,
                'nome': divida.cliente.nome
            }
            dividas_data.append(divida_dict)
        
        return jsonify({
            'success': True,
            'data': dividas_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

@dividas_bp.route('/dividas/<int:divida_id>', methods=['GET'])
@login_required
def get_divida(divida_id):
    """Obter detalhes de uma dívida específica"""
    try:
        cliente_id = session['cliente_id']
        
        divida = Divida.query.filter_by(
            id=divida_id,
            cliente_id=cliente_id
        ).first()
        
        if not divida:
            return jsonify({
                'success': False,
                'message': 'Dívida não encontrada'
            }), 404
        
        divida_dict = divida.to_dict()
        divida_dict['cliente'] = {
            'matricula': divida.cliente.matricula,
            'nome': divida.cliente.nome
        }
        
        return jsonify({
            'success': True,
            'data': divida_dict
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

@dividas_bp.route('/dividas/<int:divida_id>/opcoes', methods=['GET'])
@login_required
def get_opcoes_negociacao(divida_id):
    """Obter opções de negociação para uma dívida"""
    try:
        cliente_id = session['cliente_id']
        
        # Verificar se a dívida pertence ao cliente logado
        divida = Divida.query.filter_by(
            id=divida_id,
            cliente_id=cliente_id
        ).first()
        
        if not divida:
            return jsonify({
                'success': False,
                'message': 'Dívida não encontrada'
            }), 404
        
        opcoes = OpcaoNegociacao.query.filter_by(divida_id=divida_id).all()
        
        opcoes_data = []
        for opcao in opcoes:
            opcoes_data.append(opcao.to_dict())
        
        # Ordenar por melhor opção primeiro, depois por desconto
        opcoes_data.sort(key=lambda x: (not x['melhor_opcao'], -x['percentual_desconto']))
        
        return jsonify({
            'success': True,
            'data': opcoes_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

