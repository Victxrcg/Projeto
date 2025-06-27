from flask import Blueprint, request, jsonify, session, send_file
from src.models.acicg import db, Cliente, Divida, OpcaoNegociacao, Boleto
from datetime import datetime, date, timedelta
from functools import wraps
import random
import string
import io

boletos_bp = Blueprint("boletos", __name__)

def login_required(f):
    """Decorator para verificar se o usuário está logado"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "cliente_id" not in session:
            return jsonify({
                "success": False,
                "message": "Login necessário"
            }), 401
        return f(*args, **kwargs)
    return decorated_function

def gerar_codigo_barras():
    """Gerar código de barras fictício para o boleto"""
    # Formato simplificado: 47 dígitos
    banco = "001"  # Código do banco
    moeda = "9"    # Real
    dv = "1"       # Dígito verificador
    vencimento = "9999"  # Dias desde 07/10/1997
    valor = "".join([str(random.randint(0, 9)) for _ in range(10)])
    nosso_numero = "".join([str(random.randint(0, 9)) for _ in range(11)])
    agencia = "".join([str(random.randint(0, 9)) for _ in range(4)])
    conta = "".join([str(random.randint(0, 9)) for _ in range(8)])
    carteira = "".join([str(random.randint(0, 9)) for _ in range(3)])
    
    codigo = banco + moeda + dv + vencimento + valor + nosso_numero + agencia + conta + carteira
    return codigo

def gerar_pdf_boleto(boleto, divida, cliente, opcao):
    """Gerar PDF do boleto (versão simplificada sem ReportLab)"""
    buffer = io.BytesIO()
    content = f"""
    Boleto ACICG

    Cliente: {cliente.nome}
    Matrícula: {cliente.matricula}
    CPF/CNPJ: {cliente.cpf_cnpj}

    Dívida: R$ {divida.valor_original:.2f}
    Desconto: {opcao.percentual_desconto}%
    Valor Final: R$ {opcao.valor_final:.2f}
    Economia: R$ {opcao.economia:.2f}

    Valor a Pagar: R$ {boleto.valor:.2f}
    Vencimento: {boleto.data_vencimento.strftime("%d/%m/%Y")}
    Código de Barras: {boleto.codigo_barras}

    Instruções:
    - Pague este boleto em qualquer banco, lotérica ou internet banking
    - Após o vencimento, sujeito a multa e juros
    - Em caso de dúvidas, entre em contato conosco

    Gerado em: {datetime.now().strftime("%d/%m/%Y às %H:%M")}
    """
    buffer.write(content.encode("utf-8"))
    buffer.seek(0)
    return buffer

@boletos_bp.route("/boletos/gerar", methods=["POST"])
@login_required
def gerar_boleto():
    """Gerar boleto para uma opção de negociação"""
    try:
        data = request.get_json()
        opcao_id = data.get("opcao_id")
        
        if not opcao_id:
            return jsonify({
                "success": False,
                "message": "ID da opção de negociação é obrigatório"
            }), 400
        
        cliente_id = session["cliente_id"]
        
        # Verificar se a opção pertence a uma dívida do cliente
        opcao = OpcaoNegociacao.query.join(Divida).filter(
            OpcaoNegociacao.id == opcao_id,
            Divida.cliente_id == cliente_id
        ).first()
        
        if not opcao:
            return jsonify({
                "success": False,
                "message": "Opção de negociação não encontrada"
            }), 404
        
        # Verificar se já existe um boleto para esta opção
        boleto_existente = Boleto.query.filter_by(
            opcao_negociacao_id=opcao_id,
            status="pendente"
        ).first()
        
        if boleto_existente:
            return jsonify({
                "success": True,
                "message": "Boleto já existe",
                "data": boleto_existente.to_dict()
            })
        
        # Gerar novo boleto
        codigo_barras = gerar_codigo_barras()
        data_vencimento = date.today() + timedelta(days=7)  # 7 dias para vencimento
        
        # Determinar valor do boleto
        if opcao.tipo == "a_vista":
            valor_boleto = opcao.valor_final
        else:
            # Para parcelado, gerar boleto da entrada
            valor_boleto = opcao.valor_entrada if opcao.valor_entrada else opcao.valor_parcela
        
        boleto = Boleto(
            divida_id=opcao.divida_id,
            opcao_negociacao_id=opcao_id,
            codigo_barras=codigo_barras,
            valor=valor_boleto,
            data_vencimento=data_vencimento
        )
        
        db.session.add(boleto)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Boleto gerado com sucesso",
            "data": boleto.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@boletos_bp.route("/boletos/<int:boleto_id>/download", methods=["GET"])
@login_required
def download_boleto(boleto_id):
    """Download do PDF do boleto"""
    try:
        cliente_id = session["cliente_id"]
        
        # Verificar se o boleto pertence ao cliente
        boleto = Boleto.query.join(Divida).filter(
            Boleto.id == boleto_id,
            Divida.cliente_id == cliente_id
        ).first()
        
        if not boleto:
            return jsonify({
                "success": False,
                "message": "Boleto não encontrado"
            }), 404
        
        # Obter dados relacionados
        divida = boleto.divida
        cliente = divida.cliente
        opcao = boleto.opcao_negociacao
        
        # Gerar PDF
        pdf_buffer = gerar_pdf_boleto(boleto, divida, cliente, opcao)
        
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name=f"boleto_acicg_{boleto.id}.txt", # Alterado para .txt
            mimetype="text/plain" # Alterado para text/plain
        )
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@boletos_bp.route("/boletos", methods=["GET"])
@login_required
def get_boletos():
    """Listar boletos do cliente"""
    try:
        cliente_id = session["cliente_id"]
        
        boletos = Boleto.query.join(Divida).filter(
            Divida.cliente_id == cliente_id
        ).order_by(Boleto.created_at.desc()).all()
        
        boletos_data = []
        for boleto in boletos:
            boleto_dict = boleto.to_dict()
            boleto_dict["divida"] = {
                "id": boleto.divida.id,
                "valor_original": float(boleto.divida.valor_original)
            }
            boleto_dict["opcao"] = {
                "tipo": boleto.opcao_negociacao.tipo,
                "percentual_desconto": boleto.opcao_negociacao.percentual_desconto
            }
            boletos_data.append(boleto_dict)
        
        return jsonify({
            "success": True,
            "data": boletos_data
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

