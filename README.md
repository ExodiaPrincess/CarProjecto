# Verniz

Protótipo de um site premium de orçamentos de pintura e chapa. O cliente escreve a matrícula, confirma a viatura, toca nas peças a reparar num desenho do carro em cinco vistas e recebe uma estimativa imediata. Depois pode pedir um orçamento confirmado, com fotografias dos danos.

Feito com React, Tailwind CSS, Framer Motion, ícones Lucide e three.js. Depois da pesquisa, a viatura aparece num modelo 3D que se pode rodar e onde se tocam as peças; há também cinco vistas desenhadas em SVG, com cada peça como zona clicável independente.

## Abrir

Abra `index.html` no navegador (precisa de internet para carregar React, three.js, Framer Motion e as fontes). No Vercel, o site abre logo no endereço principal.

Um link com a matrícula no fim (por exemplo `…/#73-SX-98`) abre logo esse carro.

Matrículas de demonstração (não gastam créditos): `73-SX-98`, `AB-12-CD`, `45-RT-21`, `AE-77-ZX`, `BT-05-EV`, `AL-22-HN`. Qualquer outra é pesquisada no RegCheck quando estiver ligado (ver abaixo); se não houver dados, abre o formulário para indicar a viatura à mão.

## Alterar e voltar a gerar

```bash
npm install
npm run build:site   # gera de novo index.html
```

| Quero mudar… | Onde |
|---|---|
| Preços, multiplicadores, desconto | `src/data/pricing.js` |
| Matrículas de demonstração | `src/data/vehicles.js` |
| Textos (PT / EN) | `src/i18n.jsx` |
| Forma dos carros e das peças | `src/car/geometry.js` |
| Cores e tipos de letra | `tailwind.config.cjs`, `src/styles.css` |
| Pesquisa no RegCheck | `api/plate.js`, `src/services/vehicleLookup.js` |
| Fotografias do topo | `assets/hero/` e `src/data/heroPhotos.js` |
| Modelo 3D de cada carroçaria | `MODEL_FOR` em `src/car/Car3D.jsx` |

## Fotografias e modelos 3D

- As fotografias do topo são do Unsplash (licença Unsplash, uso comercial permitido): Hyundai Motor Group, Puscas Adryan e Petko Boiadjiev. Duas mostram o logótipo da Hyundai.
- Os carros 3D são de Quaternius (CC0), os mesmos da raiz do repositório (`assets/models/cars.json`). São formas genéricas por tipo de carroçaria, não o modelo exato. A carrinha usa por agora o SUV.
- `index.html` carrega as fotografias da pasta `assets/hero/`, por isso as duas têm de estar juntas.

## Ligar a pesquisa real de matrículas (RegCheck)

A pasta `api/` tem duas funções que o Vercel publica sozinho:

- `api/plate.js` pergunta ao RegCheck (`CheckPortugal`) a marca, o modelo, o ano, o combustível e a imagem do modelo.
- `api/car-image.js` passa a imagem do RegCheck pelo próprio site, porque o RegCheck a serve em `http` e um site `https` não a pode mostrar diretamente.

Para ligar:

1. Crie conta em [regcheck.org.uk](https://www.regcheck.org.uk) (ou [matricula.co.pt](https://www.matricula.co.pt)). O nome de utilizador é a "chave".
2. No Vercel: **Settings → Environment Variables**, nome `REGCHECK_USERNAME`, valor o seu nome de utilizador, para *Production* (e *Preview* se quiser).
3. **Deployments → Redeploy** para a variável entrar em vigor.

O nome de utilizador fica só no servidor; nunca chega ao navegador. Cada matrícula encontrada gasta um crédito; as respostas ficam guardadas na cache do Vercel durante um ano, por isso pesquisar a mesma matrícula outra vez normalmente não volta a gastar. Sem a variável, ou sem créditos, o site abre o formulário manual.

O registo português não indica a cor nem o tipo de carroçaria. O site adivinha a carroçaria pelo nome do modelo e pede ao cliente que confirme as duas coisas no passo *Viatura*. A imagem do RegCheck é uma imagem de referência do modelo, não do carro do cliente.

## Ainda por fazer

- Pôr a variável `REGCHECK_USERNAME` no Vercel e comprar créditos.
- Envio real do pedido de orçamento: o formulário valida tudo mas não envia nada.
- Os preços são exemplos e aparecem sempre como estimativa.

## Versão antiga

A primeira versão (carro 3D com fundo claro) está em [`classic/`](classic/).
