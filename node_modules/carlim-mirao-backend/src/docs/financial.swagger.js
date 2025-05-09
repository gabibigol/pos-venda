/**
 * @openapi
 * /api/finance/summary:
 *   get:
 *     summary: Obter resumo financeiro
 *     description: Recupera um resumo financeiro com totais e detalhamento por categoria
 *     tags:
 *       - Financeiro
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial para o resumo (formato ISO 8601)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final para o resumo (formato ISO 8601)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: ['INCOME', 'EXPENSE']
 *         description: Filtrar por tipo de transação
 *     responses:
 *       200:
 *         description: Resumo financeiro recuperado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: object
 *                   properties:
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *                 totals:
 *                   type: object
 *                   properties:
 *                     income:
 *                       type: number
 *                     expense:
 *                       type: number
 *                     balance:
 *                       type: number
 *                 categoryBreakdown:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       totalAmount:
 *                         type: number
 *                       transactionCount:
 *                         type: integer
 *       500:
 *         description: Erro interno do servidor
 *
 * /api/finance/income:
 *   get:
 *     summary: Listar transações de entrada
 *     description: Recupera transações de entrada com paginação
 *     tags:
 *       - Financeiro
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial para filtro (formato ISO 8601)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final para filtro (formato ISO 8601)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Número de itens por página
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: ['SERVICE_ORDER', 'PRODUCT_SALE', 'COMMISSION', 'OTHER_INCOME']
 *         description: Filtrar por categoria de entrada
 *     responses:
 *       200:
 *         description: Transações de entrada recuperadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       type:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       category:
 *                         type: string
 *                       transactionDate:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       500:
 *         description: Erro interno do servidor
 *
 * /api/finance/transactions:
 *   post:
 *     summary: Criar transação financeira
 *     description: Cria uma nova transação financeira
 *     tags:
 *       - Financeiro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - amount
 *               - category
 *             properties:
 *               type:
 *                 type: string
 *                 enum: ['INCOME', 'EXPENSE']
 *               amount:
 *                 type: number
 *                 minimum: 0
 *               category:
 *                 type: string
 *                 enum: [
 *                   'SERVICE_ORDER', 'PRODUCT_SALE', 'COMMISSION', 'OTHER_INCOME',
 *                   'SALARY', 'SUPPLIER', 'EQUIPMENT', 'MAINTENANCE',
 *                   'UTILITIES', 'TAX', 'OTHER_EXPENSE'
 *                 ]
 *               transactionDate:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *               clientId:
 *                 type: integer
 *               origin:
 *                 type: string
 *                 enum: ['SERVICE_ORDER', 'PRODUCT_SALE', 'MANUAL_ENTRY']
 *               status:
 *                 type: string
 *                 enum: ['PENDING', 'COMPLETED', 'CANCELED', 'OVERDUE']
 *     responses:
 *       201:
 *         description: Transação criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 type:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 category:
 *                   type: string
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro interno do servidor
 */
