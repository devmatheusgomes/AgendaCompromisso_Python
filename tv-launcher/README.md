# Launcher para Samsung Tizen (UN55AU7700)

Tela inicial com foto do dia de fundo, relógio, clima de Goiânia/GO e uma faixa de apps em cartões coloridos.
Ele é instalado como um app comum pelo Modo Desenvolvedor. **Não substitui o Smart Hub da Samsung.**
Você abre o app e usa como tela inicial.

- **Fundo:** foto do dia do Bing (com título e crédito no canto), `wallpaper.jpg` local ou sem foto.
- **Clima:** Open-Meteo (gratuito, sem chave), atualizado a cada 30 min. A localização fica fixa em
  `PLACE` no começo do `js/main.js` (coordenadas de Goiânia; troque lá se quiser outro ponto).
- **Cartões:** cores e nome em texto para os apps mais comuns. Os demais usam o ícone que a própria TV fornece.
- Sem internet, o launcher mostra a última foto e o último clima salvos.

## Controles

| Tecla | Na tela inicial | No painel Personalizar |
|---|---|---|
| ◀ ▶ | navega entre os apps | navega entre os itens |
| ▲ ▼ | alterna entre a faixa de apps e os botões do topo | troca de seção / rola a lista de apps |
| OK | abre o app | escolhe tema, executa ação ou adiciona/remove app |
| Voltar | sai do modo reorganizar | fecha o painel |
| Vermelho | liga/desliga o modo reorganizar | — |
| Verde | abre o painel | fecha o painel |
| Amarelo | abre Todos os apps | — |

As teclas coloridas ficam no botão **123** do controle One Remote. Sem elas, tudo funciona pelos botões do topo: **Todos os apps** e **Personalizar** (⚙).

## Personalizar

- **Papel de parede próprio:** coloque `wallpaper.jpg` (1920x1080) nesta pasta antes de empacotar e escolha *Fundo: wallpaper.jpg* no painel.
- **Ícones próprios:** coloque `icons/<ID do app>.png` (250x140, cobre o cartão inteiro). O ID aparece no Device Manager do Tizen Studio ou no comando `sdb shell 0 applist`. Sem PNG, o launcher usa as cores e o nome do app.
- **Visualizar no PC:** abra o `index.html` no Chrome. Ele roda em modo demonstração com apps fictícios.

## Instalação no Windows

### 1. Tizen Studio
1. Baixe e instale o Tizen Studio (com IDE) em https://developer.tizen.org/development/tizen-studio/download
2. Abra o **Package Manager** e, na aba *Extension SDK*, instale **Samsung TV Extensions** (inclui o *Samsung Certificate Extension*).

### 2. Modo Desenvolvedor na TV
1. Descubra o IP do PC: `ipconfig` no Prompt de Comando (campo *Endereço IPv4*).
2. Na TV: **Apps** > digite `12345` > **Developer Mode: On** > informe o IP do PC > reinicie a TV (desligue da tomada por 30 s se necessário).
3. Anote o IP da TV em *Configurações > Geral > Rede > Status da Rede*.

### 3. Conectar
No Tizen Studio, abra o **Device Manager** > **Remote Device Manager** > **+** > informe o IP da TV (porta 26101) e ative a conexão.
Ou pelo terminal (`C:\tizen-studio\tools\sdb.exe`):

    sdb connect IP_DA_TV
    sdb devices

### 4. Certificado Samsung
**Tools > Certificate Manager > +** > escolha **Samsung** > tipo **TV** > crie o certificado de autor e o de distribuidor (pede login com conta Samsung).
O DUID da TV conectada é incluído automaticamente no certificado de distribuidor.

### 5. Empacotar e instalar
Pelo terminal (`C:\tizen-studio\tools\ide\bin` no PATH), dentro desta pasta:

    tizen package -t wgt -s NOME_DO_PERFIL_DE_CERTIFICADO
    tizen install -n Inicio.wgt -t NOME_DO_DISPOSITIVO

O nome do dispositivo aparece em `sdb devices`. Se preferir o modo gráfico, importe a pasta como projeto web no Tizen Studio e use **Run As > Tizen Web Application**.

O app aparece na TV como **Inicio** em *Apps*. Mova ele para o começo da barra do Smart Hub para abrir mais rápido.
