const { Model, DataTypes } = require('sequelize');

class FinancialTransaction extends Model {
  static init(sequelize) {
    super.init({
      // Identificador único da transação
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      // Tipo de transação
      type: {
        type: DataTypes.ENUM('INCOME', 'EXPENSE'),
        allowNull: false
      },

      // Valor da transação
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: 'O valor da transação não pode ser negativo'
          },
          isDecimal: {
            args: [{ decimal_digits: '2' }],
            msg: 'O valor deve ter no máximo duas casas decimais'
          }
        }
      },

      // Categoria da transação
      category: {
        type: DataTypes.ENUM(
          // Categorias de Entrada
          'SERVICE_ORDER',
          'PRODUCT_SALE',
          'COMMISSION',
          'OTHER_INCOME',

          // Categorias de Saída
          'SALARY',
          'SUPPLIER',
          'EQUIPMENT',
          'MAINTENANCE',
          'UTILITIES',
          'TAX',
          'OTHER_EXPENSE'
        ),
        allowNull: false,
        validate: {
          isValidCategory(value) {
            const validIncomeCategories = [
              'SERVICE_ORDER',
              'PRODUCT_SALE',
              'COMMISSION',
              'OTHER_INCOME'
            ];
            const validExpenseCategories = [
              'SALARY',
              'SUPPLIER',
              'EQUIPMENT',
              'MAINTENANCE',
              'UTILITIES',
              'TAX',
              'OTHER_EXPENSE'
            ];

            // Validar se a categoria corresponde ao tipo de transação
            if (this.type === 'INCOME' && !validIncomeCategories.includes(value)) {
              throw new Error('Categoria inválida para transação de entrada');
            }

            if (this.type === 'EXPENSE' && !validExpenseCategories.includes(value)) {
              throw new Error('Categoria inválida para transação de saída');
            }
          }
        }
      },

      // Data da transação
      transactionDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
          isDate: {
            args: true,
            msg: 'Data da transação inválida'
          },
          isPast(value) {
            if (new Date(value) > new Date()) {
              throw new Error('A data da transação não pode ser futura');
            }
          }
        }
      },

      // Descrição detalhada
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 500],
            msg: 'Descrição muito longa (máximo 500 caracteres)'
          }
        }
      },

      // Cliente associado (opcional)
      clientId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },

      // Origem da transação
      origin: {
        type: DataTypes.ENUM(
          'SERVICE_ORDER',
          'PRODUCT_SALE',
          'MANUAL_ENTRY'
        ),
        allowNull: false,
        defaultValue: 'MANUAL_ENTRY'
      },

      // Status da transação
      status: {
        type: DataTypes.ENUM(
          'PENDING',
          'COMPLETED',
          'CANCELED',
          'OVERDUE'
        ),
        allowNull: false,
        defaultValue: 'PENDING',
        validate: {
          isValidStatus(value) {
            const validStatuses = ['PENDING', 'COMPLETED', 'CANCELED', 'OVERDUE'];

            if (!validStatuses.includes(value)) {
              throw new Error('Status de transação inválido');
            }
          }
        }
      },

      // Referência externa (opcional)
      referenceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID da ordem de serviço ou venda relacionada'
      }
    }, {
      sequelize,
      modelName: 'FinancialTransaction',
      tableName: 'financial_transactions',
      timestamps: true,
      underscored: true,

      // Hooks para validações adicionais
      hooks: {
        beforeValidate: (transaction, options) => {
          // Garantir que o valor seja positivo
          if (transaction.amount && transaction.amount < 0) {
            transaction.amount = Math.abs(transaction.amount);
          }

          // Validar origem da transação
          if (!transaction.origin) {
            transaction.origin = 'MANUAL_ENTRY';
          }
        }
      }
    });

    return this;
  }

  // Associações
  static associate(models) {
    // Associação opcional com Cliente
    this.belongsTo(models.Client, {
      foreignKey: 'clientId',
      as: 'client'
    });

    // Associação opcional com Ordem de Serviço
    this.belongsTo(models.ServiceOrder, {
      foreignKey: 'referenceId',
      constraints: false,
      scope: {
        origin: 'SERVICE_ORDER'
      },
      as: 'serviceOrder'
    });
  }

  // Métodos anteriores mantidos...
}

module.exports = FinancialTransaction;
