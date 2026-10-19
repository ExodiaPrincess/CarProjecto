# Pintura por Matrícula

Protótipo de um site de orçamentos de pintura automóvel. O cliente escreve a matrícula, vê o carro em 3D, toca nas peças que precisam de pintura e recebe uma estimativa de preço na hora.

## Como abrir

É uma página única, sem build: abra `index.html` no navegador. Para a pôr online, ative o **GitHub Pages** no repositório (Settings → Pages → branch `main`, pasta `/`).

O 3D usa three.js r128, carregado do cdnjs/jsDelivr, por isso a página precisa de internet.

## O que funciona

- **Matrícula → marca e modelo.** Por agora só com as matrículas de demonstração (`73-SX-98`, `AB-12-CD`, `45-RT-21`, `AE-77-ZX`, `90-QL-08`). Para outras matrículas, o cliente escolhe o tipo de carroçaria à mão.
- **Carro 3D** com o tipo de carroçaria certo (hatchback, berlina, SUV), pintado na cor original.
- **Peças clicáveis:** para-choques, capô, tejadilho, guarda-lamas, cada porta, painéis laterais traseiros, mala ou porta da bagageira, espelhos.
- **Orçamento em direto:** trabalho por peça (só pintura / riscos / amolgadela), tipo de tinta (sólida, metalizada, pérola), ajuste pelo tamanho do carro e por marca premium, desconto a partir de 4 peças, intervalo de ±12% e botão para copiar o resumo.

## Onde mexer

| Quero mudar… | Onde |
|---|---|
| Preços | Objeto `PRICES` no topo do script em `index.html` |
| Matrículas de demonstração | Objeto `DEMO` |
| Pesquisa real de matrículas | Função `lookupPlate()` (ver abaixo) |
| Que modelo 3D cada carroçaria usa | `MODEL_FOR` |

### Ligar a pesquisa real de matrículas

Substitua `lookupPlate()` por uma chamada ao **seu próprio backend** (por exemplo `fetch('/api/plate?p=' + plate)`). Esse backend chama a API paga (RegCheck, openapi.com…) com a sua chave e guarda cada resultado, para pagar só uma vez por matrícula. **Nunca ponha a chave da API nesta página**, porque qualquer pessoa a conseguiria copiar.

## Modelos 3D

Os carros são de **Quaternius** ([quaternius.itch.io/lowpoly-cars](https://quaternius.itch.io/lowpoly-cars)), licença **CC0** (domínio público, uso comercial permitido). Os originais estão em `models/source/`.

`models/prep.py` corta cada carro em peças de pintura, gera `models/cars.json` e atualiza a cópia embutida em `index.html`:

```bash
cd models
python3 prep.py
```

Para adicionar outro carro, coloque o `.obj` e o `.mtl` em `models/source/`, acrescente uma entrada em `CARS` dentro de `prep.py` (ficheiro, material da pintura, tipo de traseira), corra o script e aponte o tipo de carroçaria para ele em `MODEL_FOR`.

Ainda não há modelo de carrinha nem de comercial ligeiro; esses tipos mostram o SUV por agora.
