from flask import Blueprint, request, jsonify, session
from src.models.acicg import db, Cliente, Divida, OpcaoNegociacao, Boleto
from datetime import datetime, date, timedelta
import random
import string

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    """Login do cliente usando matrícula ou CPF/CNPJ"""
    try:
        data = request.get_json()
        identificador = data.get('identificador', '').strip()
        
        if not identificador:
            return jsonify({
                'success': False,
                'message': 'Matrícula ou CPF/CNPJ é obrigatório'
            }), 400
        
        # Buscar cliente por matrícula ou CPF/CNPJ
        cliente = Cliente.query.filter(
            (Cliente.matricula == identificador) | 
            (Cliente.cpf_cnpj == identificador)
        ).first()
        
        if not cliente:
            return jsonify({
                'success': False,
                'message': 'Cliente não encontrado'
            }), 404
        
        # Salvar cliente na sessão
        session['cliente_id'] = cliente.id
        session['cliente_nome'] = cliente.nome
        
        return jsonify({
            'success': True,
            'message': 'Login realizado com sucesso',
            'data': {
                'id': cliente.id,
                'nome': cliente.nome,
                'matricula': cliente.matricula,
                'endereco_censurado': cliente.endereco_censurado()
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

@auth_bp.route('/auth/verify', methods=['POST'])
def verify_data():
    """Verificar dados do cliente para confirmação"""
    try:
        data = request.get_json()
        cliente_id = data.get('cliente_id')
        
        if not cliente_id:
            return jsonify({
                'success': False,
                'message': 'ID do cliente é obrigatório'
            }), 400
        
        cliente = Cliente.query.get(cliente_id)
        if not cliente:
            return jsonify({
                'success': False,
                'message': 'Cliente não encontrado'
            }), 404
        
        return jsonify({
            'success': True,
            'data': {
                'matricula': cliente.matricula,
                'nome': cliente.nome,
                'endereco_censurado': cliente.endereco_censurado()
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

@auth_bp.route('/auth/logout', methods=['POST'])
def logout():
    """Logout do cliente"""
    session.clear()
    return jsonify({
        'success': True,
        'message': 'Logout realizado com sucesso'
    })

@auth_bp.route('/auth/session', methods=['GET'])
def get_session():
    """Verificar se há uma sessão ativa"""
    if 'cliente_id' in session:
        cliente = Cliente.query.get(session['cliente_id'])
        if cliente:
            return jsonify({
                'success': True,
                'data': {
                    'id': cliente.id,
                    'nome': cliente.nome,
                    'matricula': cliente.matricula
                }
            })
    
    return jsonify({
        'success': False,
        'message': 'Sessão não encontrada'
    }), 401

