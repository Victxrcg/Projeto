from src.models.acicg import db, Cliente, Divida, OpcaoNegociacao
from datetime import date, timedelta
from decimal import Decimal

def criar_dados_exemplo():
    """Criar dados de exemplo para demonstração"""
    
    # Verificar se já existem dados
    if Cliente.query.first():
        print("Dados já existem no banco")
        return
    
    # Criar cliente de exemplo
    cliente = Cliente(
        nome="ORLANDO LUIZ CARDOSO MORAES",
        cpf_cnpj="123.456.789-00",
        matricula="01167109",
        endereco="RUA P*** M* D*, *** - RIO DE JANEIRO",
        telefone="(21) 99999-9999",
        email="orlando@email.com"
    )
    
    db.session.add(cliente)
    db.session.flush()  # Para obter o ID do cliente
    
    # Criar dívida de exemplo
    divida = Divida(
        cliente_id=cliente.id,
        credor="ACICG",
        valor_original=Decimal('36621.31'),
        valor_atual=Decimal('36621.31'),
        numero_faturas=7,
        data_vencimento=date.today() + timedelta(days=30),
        status='pendente'
    )
    
    db.session.add(divida)
    db.session.flush()  # Para obter o ID da dívida
    
    # Criar opções de negociação
    opcoes = [
        {
            'tipo': 'a_vista',
            'percentual_desconto': 78,
            'valor_final': Decimal('7960.82'),
            'economia': Decimal('28660.49'),
            'melhor_opcao': True,
            'numero_parcelas': 1
        },
        {
            'tipo': 'parcelado',
            'percentual_desconto': 75,
            'valor_final': Decimal('9204.70'),
            'valor_entrada': Decimal('1534.12'),
            'numero_parcelas': 5,
            'valor_parcela': Decimal('1534.12'),
            'economia': Decimal('27416.61'),
            'melhor_opcao': False
        },
        {
            'tipo': 'parcelado',
            'percentual_desconto': 59,
            'valor_final': Decimal('14926.61'),
            'valor_entrada': Decimal('1243.88'),
            'numero_parcelas': 11,
            'valor_parcela': Decimal('1243.88'),
            'economia': Decimal('21694.70'),
            'melhor_opcao': False
        },
        {
            'tipo': 'parcelado',
            'percentual_desconto': 52,
            'valor_final': Decimal('17414.38'),
            'valor_entrada': Decimal('725.60'),
            'numero_parcelas': 23,
            'valor_parcela': Decimal('725.60'),
            'economia': Decimal('19206.93'),
            'melhor_opcao': False
        }
    ]
    
    for opcao_data in opcoes:
        opcao = OpcaoNegociacao(
            divida_id=divida.id,
            tipo=opcao_data['tipo'],
            percentual_desconto=opcao_data['percentual_desconto'],
            valor_final=opcao_data['valor_final'],
            valor_entrada=opcao_data.get('valor_entrada'),
            numero_parcelas=opcao_data['numero_parcelas'],
            valor_parcela=opcao_data.get('valor_parcela'),
            economia=opcao_data['economia'],
            melhor_opcao=opcao_data['melhor_opcao'],
            valido_ate=date.today() + timedelta(days=30)
        )
        db.session.add(opcao)
    
    # Criar mais alguns clientes para teste
    clientes_extras = [
        {
            'nome': 'MARIA SILVA SANTOS',
            'cpf_cnpj': '987.654.321-00',
            'matricula': '01234567',
            'endereco': 'AV. BRA*** *** - SÃO PAULO',
            'telefone': '(11) 88888-8888',
            'email': 'maria@email.com'
        },
        {
            'nome': 'JOÃO PEREIRA COSTA',
            'cpf_cnpj': '456.789.123-00',
            'matricula': '07654321',
            'endereco': 'RUA DAS FLO*** *** - BELO HORIZONTE',
            'telefone': '(31) 77777-7777',
            'email': 'joao@email.com'
        }
    ]
    
    for cliente_data in clientes_extras:
        cliente_extra = Cliente(**cliente_data)
        db.session.add(cliente_extra)
        db.session.flush()
        
        # Criar uma dívida menor para cada cliente extra
        divida_extra = Divida(
            cliente_id=cliente_extra.id,
            credor="ACICG",
            valor_original=Decimal('15000.00'),
            valor_atual=Decimal('15000.00'),
            numero_faturas=3,
            data_vencimento=date.today() + timedelta(days=45),
            status='pendente'
        )
        db.session.add(divida_extra)
        db.session.flush()
        
        # Criar algumas opções para cada dívida extra
        opcoes_extras = [
            {
                'tipo': 'a_vista',
                'percentual_desconto': 70,
                'valor_final': Decimal('4500.00'),
                'economia': Decimal('10500.00'),
                'melhor_opcao': True,
                'numero_parcelas': 1
            },
            {
                'tipo': 'parcelado',
                'percentual_desconto': 60,
                'valor_final': Decimal('6000.00'),
                'valor_entrada': Decimal('1000.00'),
                'numero_parcelas': 5,
                'valor_parcela': Decimal('1000.00'),
                'economia': Decimal('9000.00'),
                'melhor_opcao': False
            }
        ]
        
        for opcao_data in opcoes_extras:
            opcao_extra = OpcaoNegociacao(
                divida_id=divida_extra.id,
                tipo=opcao_data['tipo'],
                percentual_desconto=opcao_data['percentual_desconto'],
                valor_final=opcao_data['valor_final'],
                valor_entrada=opcao_data.get('valor_entrada'),
                numero_parcelas=opcao_data['numero_parcelas'],
                valor_parcela=opcao_data.get('valor_parcela'),
                economia=opcao_data['economia'],
                melhor_opcao=opcao_data['melhor_opcao'],
                valido_ate=date.today() + timedelta(days=30)
            )
            db.session.add(opcao_extra)
    
    db.session.commit()
    print("Dados de exemplo criados com sucesso!")
    print(f"Cliente principal: {cliente.nome} - Matrícula: {cliente.matricula}")
    print(f"CPF para teste: {cliente.cpf_cnpj}")
    print("Outros clientes também foram criados para teste.")

if __name__ == "__main__":
    # Este arquivo pode ser executado diretamente para popular o banco
    from src.models.acicg import db
    from flask import Flask
    import os
    
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), '..', 'database', 'app.db')}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    
    with app.app_context():
        db.create_all()
        criar_dados_exemplo()

