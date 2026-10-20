# Atividade: Refatoração de Projeto Orientado a Objetos

## Contexto

Este projeto implementa um sistema simples de pedidos para uma loja virtual chamada **TechStore**. O sistema permite criar pedidos, calcular descontos, calcular frete, processar pagamentos, atualizar estoque, registrar o pedido e enviar uma notificação ao cliente.

A proposta da atividade é analisar a organização das classes e métodos, identificar oportunidades de melhoria e refatorar o projeto aplicando princípios de projeto orientado a objetos (SOLID).

## Objetivos da atividade

- Identificar problemas na organização de classes e métodos.
- Avaliar coesão, acoplamento e distribuição de responsabilidades.
- Aplicar princípios SOLID.
- Aplicar composição quando adequado.
- Aplicar o Princípio de Demeter.
- Melhorar a testabilidade e a manutenção do sistema.
- Preservar o comportamento já existente.

## Como executar

Requisitos:

- Node.js 20 ou superior.

Comandos:

```bash
npm start
```

Testes automatizados (Node.js test runner nativo, sem dependencias externas):

```bash
npm test
```

## Estrutura do projeto refatorado

```
src/
  domain/         entidades e constantes (Order, OrderItem, Product, Customer, Address, OrderStatus, PaymentStatus, PaymentMethod)
  validation/     validadores de pedido (CustomerValidator, OrderItemsValidator, OrderValidator)
  pricing/
    discount/     regras de desconto (CustomerTypeDiscount, CouponDiscount, HighValueOrderDiscount, DiscountCalculator)
    freight/      calculo de frete (FreightCalculator, FreeShippingPolicy)
    payment/      estrategias de pagamento (PixPayment, CreditCardPayment, BoletoPayment, PaymentProcessor)
    OrderPricingCalculator.js
  summary/        montagem e impressao do resumo (OrderSummaryFactory, ConsoleOrderSummaryPrinter)
  services/       OrderService (orquestrador), InventoryService, NotificationService
  repositories/   ProductRepository, OrderRepository
  config/         pricingConfig (valores de negocio) e buildOrderService (composition root)
  utils/          Logger
test/             testes unitarios, de integracao e de execucao ponta a ponta
```
