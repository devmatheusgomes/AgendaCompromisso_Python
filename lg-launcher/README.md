# Launcher para LG webOS (55UM7520PSB, webOS 4.5) — sem root

É o mesmo launcher da Samsung (`../tv-launcher`): foto do dia, relógio, clima de Goiânia e faixa de apps.
Esta pasta só tem o que muda na LG:

| Arquivo | Para quê |
|---|---|
| `appinfo.json`, `icon.png`, `largeIcon.png` | identificação do app no webOS |
| `js/platform.js` | troca as chamadas da Samsung pelas do webOS (abrir apps, listar apps, sair) |
| `css/platform.css` | ajustes para o navegador antigo da TV (sem `gap`, sem desfoque) |
| `instalar-lg.ps1` | junta tudo, empacota e instala |
| `lg_tv.py` | pela rede: lista os IDs dos apps/entradas e troca a saída de som |

Na primeira execução a faixa mostra **Netflix, Disney+, Max e HDMI 1** (os que estiverem instalados).
O player "Tocando agora" não existe na LG: não há uma forma pública de ler o que outro app está tocando.

## Limitações (sem root)

- **O Modo Desenvolvedor expira.** Vale cerca de 50 horas. Abra o app *Developer Mode* na TV e use
  **Extend** antes de acabar. Se expirar, o launcher é removido e precisa ser instalado de novo.
- **Não abre sozinho quando a TV liga** e **não substitui** a Home da LG: abra o *Inicio* pela barra.
- Apps de fábrica não podem ser desinstalados, só retirados da barra.

## 1. Conta e Modo Desenvolvedor

1. Crie uma conta de desenvolvedor LG em https://webostv.developer.lge.com
2. Na TV, abra a **LG Content Store**, procure **Developer Mode** e instale.
3. Abra o Developer Mode, entre com a conta, ligue **Dev Mode Status** e deixe a TV reiniciar.
4. Abra o Developer Mode de novo e ligue **Key Server**. Anote o IP e a *passphrase* mostrados.

## 2. Ferramentas no PC (Windows)

1. Instale o Node.js (versão LTS) em https://nodejs.org
2. No PowerShell:

       npm install -g @webos-tools/cli

3. Cadastre a TV (use o nome `tv`, IP da TV, porta `9922`, usuário `prisoner`):

       ares-setup-device

4. Baixe a chave de acesso (pede a passphrase do passo 1.4):

       ares-novacom --device tv --getkey

## 3. Instalar

Na pasta `lg-launcher` (a pasta `tv-launcher` precisa estar ao lado dela):

    powershell -ExecutionPolicy Bypass -File instalar-lg.ps1 -Tv tv

## 4. Se algum app não aparecer (ex.: Max)

O launcher tenta ler a lista de apps da TV. Se a TV não permitir, ele usa uma lista fixa em `js/platform.js`.
Para descobrir o ID certo de cada app (Python 3.12+):

    pip install aiowebostv
    python lg_tv.py IP_DA_TV apps

Na primeira vez a TV pergunta se aceita a conexão: confirme no controle.
Coloque o ID do Max em `FALLBACK_APPS` no `js/platform.js` e instale de novo.

## 5. Som pelo óptico

Pela TV: **Configurações > Som > Saída de som > Saída óptica**. Ou pelo PC:

    python lg_tv.py IP_DA_TV som

mostra a saída atual. Com o som saindo pelo óptico, o valor mostrado é o que serve para voltar a ele depois:
`python lg_tv.py IP_DA_TV som VALOR`.

## 6. Limpeza e fluidez

- **Configurações > Geral > Início Rápido+: Desligado** (a TV reinicia de verdade a cada desligamento).
- **Configurações > Geral > LivePlus: Desligado.**
- **Geral > Sobre esta TV > Contratos do usuário:** desmarque informações de visualização, publicidade
  baseada em interesses e informações de voz.
- **Barra da Home:** segure OK num app, aperte ▲ e use o **X** para remover. Os de fábrica sem X vão para o fim.
- De vez em quando, tire a TV da tomada por 1 minuto.

Os nomes dos menus podem variar um pouco conforme a versão do software.
