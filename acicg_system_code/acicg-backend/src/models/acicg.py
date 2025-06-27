from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy.dialects.sqlite import JSON

db = SQLAlchemy()

class Cliente(db.Model):
    __tablename__ = 'clientes'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255), nullable=False)
    cpf_cnpj = db.Column(db.String(20), unique=True, nullable=False)
    matricula = db.Column(db.String(50), unique=True, nullable=False)
    endereco = db.Column(db.Text)
    telefone = db.Column(db.String(20))
    email = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    dividas = db.relationship('Divida', backref='cliente', lazy=True)
    
    def __repr__(self):
        return f'<Cliente {self.nome}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'cpf_cnpj': self.cpf_cnpj,
            'matricula': self.matricula,
            'endereco': self.endereco,
            'telefone': self.telefone,
            'email': self.email
        }
    
    def endereco_censurado(self):
        """Retorna endereço censurado para segurança"""
        if not self.endereco:
            return ""
        parts = self.endereco.split(',')
        if len(parts) >= 2:
            return f"{parts[0][:3]}*** - {parts[-1].strip()}"
        return self.endereco[:10] + "***"

class Divida(db.Model):
    __tablename__ = 'dividas'
    
    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)
    credor = db.Column(db.String(100), default='ACICG')
    valor_original = db.Column(db.Numeric(10, 2), nullable=False)
    valor_atual = db.Column(db.Numeric(10, 2), nullable=False)
    numero_faturas = db.Column(db.Integer, default=1)
    data_vencimento = db.Column(db.Date)
    status = db.Column(db.String(20), default='pendente')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    opcoes_negociacao = db.relationship('OpcaoNegociacao', backref='divida', lazy=True)
    boletos = db.relationship('Boleto', backref='divida', lazy=True)
    
    def __repr__(self):
        return f'<Divida {self.id} - {self.valor_atual}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'credor': self.credor,
            'valor_original': float(self.valor_original),
            'valor_atual': float(self.valor_atual),
            'numero_faturas': self.numero_faturas,
            'data_vencimento': self.data_vencimento.isoformat() if self.data_vencimento else None,
            'status': self.status
        }

class OpcaoNegociacao(db.Model):
    __tablename__ = 'opcoes_negociacao'
    
    id = db.Column(db.Integer, primary_key=True)
    divida_id = db.Column(db.Integer, db.ForeignKey('dividas.id'), nullable=False)
    tipo = db.Column(db.String(20), nullable=False)  # 'a_vista', 'parcelado'
    percentual_desconto = db.Column(db.Integer, nullable=False)
    valor_final = db.Column(db.Numeric(10, 2), nullable=False)
    valor_entrada = db.Column(db.Numeric(10, 2))
    numero_parcelas = db.Column(db.Integer, default=1)
    valor_parcela = db.Column(db.Numeric(10, 2))
    economia = db.Column(db.Numeric(10, 2), nullable=False)
    melhor_opcao = db.Column(db.Boolean, default=False)
    valido_ate = db.Column(db.Date)
    
    # Relacionamentos
    boletos = db.relationship('Boleto', backref='opcao_negociacao', lazy=True)
    
    def __repr__(self):
        return f'<OpcaoNegociacao {self.tipo} - {self.percentual_desconto}%>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'tipo': self.tipo,
            'percentual_desconto': self.percentual_desconto,
            'valor_final': float(self.valor_final),
            'valor_entrada': float(self.valor_entrada) if self.valor_entrada else None,
            'numero_parcelas': self.numero_parcelas,
            'valor_parcela': float(self.valor_parcela) if self.valor_parcela else None,
            'economia': float(self.economia),
            'melhor_opcao': self.melhor_opcao,
            'valido_ate': self.valido_ate.isoformat() if self.valido_ate else None
        }

class Boleto(db.Model):
    __tablename__ = 'boletos'
    
    id = db.Column(db.Integer, primary_key=True)
    divida_id = db.Column(db.Integer, db.ForeignKey('dividas.id'), nullable=False)
    opcao_negociacao_id = db.Column(db.Integer, db.ForeignKey('opcoes_negociacao.id'), nullable=False)
    codigo_barras = db.Column(db.String(255), unique=True, nullable=False)
    valor = db.Column(db.Numeric(10, 2), nullable=False)
    data_vencimento = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='pendente')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Boleto {self.id} - {self.valor}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'codigo_barras': self.codigo_barras,
            'valor': float(self.valor),
            'data_vencimento': self.data_vencimento.isoformat(),
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }

class Acordo(db.Model):
    __tablename__ = 'acordos'

    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)
    divida_id = db.Column(db.Integer, db.ForeignKey('dividas.id'), nullable=False)
    opcao_negociacao_id = db.Column(db.Integer, db.ForeignKey('opcoes_negociacao.id'), nullable=False)
    data_aceite = db.Column(db.DateTime, default=datetime.utcnow)
    termo_aceito = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='ativo')
    parcelas = db.Column(JSON, nullable=True)  # Lista de parcelas: datas, valores, status
    pdf_url = db.Column(db.String(255), nullable=True)

    cliente = db.relationship('Cliente', backref='acordos', lazy=True)
    divida = db.relationship('Divida', backref='acordos', lazy=True)
    opcao_negociacao = db.relationship('OpcaoNegociacao', backref='acordos', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'cliente_id': self.cliente_id,
            'divida_id': self.divida_id,
            'opcao_negociacao_id': self.opcao_negociacao_id,
            'data_aceite': self.data_aceite.isoformat() if self.data_aceite else None,
            'termo_aceito': self.termo_aceito,
            'status': self.status,
            'parcelas': self.parcelas,
            'pdf_url': self.pdf_url
        }

