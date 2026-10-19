# Verniz

Protótipo de um site premium de orçamentos de pintura e chapa. O cliente escreve a matrícula, confirma a viatura, toca nas peças a reparar num desenho do carro em cinco vistas e recebe uma estimativa imediata. Depois pode pedir um orçamento confirmado, com fotografias dos danos.

Feito com React, Tailwind CSS, Framer Motion e ícones Lucide. O desenho do carro é SVG gerado por código, com cada peça como zona clicável independente.

## Abrir

Abra `index.html` no navegador (precisa de internet para carregar React, Framer Motion e as fontes). Com o GitHub Pages ativo, fica em `…/CarProjecto/verniz/`.

Um link com a matrícula no fim (por exemplo `…/verniz/#73-SX-98`) abre logo esse carro.

Matrículas de demonstração: `73-SX-98`, `AB-12-CD`, `45-RT-21`, `AE-77-ZX`, `BT-05-EV`, `AL-22-HN`. Qualquer outra abre o formulário para indicar a viatura à mão.

## Alterar e voltar a gerar

```bash
cd verniz
npm install
npm run build      # gera de novo index.html
```

| Quero mudar… | Onde |
|---|---|
| Preços, multiplicadores, desconto | `src/data/pricing.js` |
| Matrículas de demonstração | `src/data/vehicles.js` |
| Textos (PT / EN) | `src/i18n.jsx` |
| Forma dos carros e das peças | `src/car/geometry.js` |
| Cores e tipos de letra | `tailwind.config.cjs`, `src/styles.css` |

## Ligar a pesquisa real de matrículas

Defina antes do script da aplicação:

```html
<script>window.VERNIZ_CONFIG = { vehicleApiUrl: "https://o-seu-backend/api/plate" };</script>
```

O backend recebe `?plate=AA-00-AA`, chama o fornecedor (RegCheck, openapi.com…) com a sua chave secreta, guarda a resposta e devolve JSON. `normalizeVehicle()` em `src/services/vehicleLookup.js` aceita o formato do próprio site ou o do RegCheck. Nunca ponha a chave do fornecedor no site.

## Ainda por fazer

- Pesquisa real de matrículas (só dados de demonstração).
- Envio real do pedido de orçamento: o formulário valida tudo mas não envia nada.
- Os preços são exemplos e aparecem sempre como estimativa.
