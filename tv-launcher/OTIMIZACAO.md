# Otimização da TV (UN55AU7700)

O que dá para fazer com segurança, sem root e sem mexer no firmware.
Os nomes dos menus podem variar um pouco conforme a versão do software da TV.

## 1. Abrir o launcher quando a TV liga

O Tizen não permite que um app instalado pelo Modo Desenvolvedor se registre para abrir sozinho na inicialização.
O jeito que funciona é usar um recurso da própria Samsung:

1. **Configurações > Geral > Recursos Smart**
2. Ligue **Executar último app automaticamente** (Autorun Last App).
3. Desligue **Executar Smart Hub automaticamente** (Autorun Smart Hub).

A TV reabre o **último app que estava aberto** quando foi desligada. Então, antes de desligar,
aperte **Home** e abra o **Inicio**. Dica: deixe o Inicio na primeira posição da barra do Smart Hub.

## 2. "Limpar a RAM"

Não existe limpador de RAM de verdade para TVs Tizen: apps de terceiros não conseguem fechar outros apps.
O sistema já fecha apps parados quando precisa de memória. O que realmente libera tudo é **reiniciar de verdade**:

- **Pelo controle:** segure o botão **Liga/Desliga** até a TV desligar e aparecer o logo Samsung de novo.
- **Pela tomada:** desligue da tomada por 30 segundos.

Fazer isso de vez em quando (por exemplo, uma vez por semana) resolve a maioria das lentidões.
Desligar pelo controle normalmente coloca a TV em espera, que não limpa a memória.

Se o seu software tiver **Configurações > Suporte > Cuidados com o dispositivo** (Device Care), use a opção de
otimização de lá. Ela é oficial da Samsung, mas não está disponível em todos os modelos e versões.

## 3. Deixar mais fluido

- **No launcher:** deixe **Modo leve** ligado (padrão). Ele tira o desfoque de vidro e as sombras, que são as partes
  mais pesadas para o processador da TV. Fica em ⚙ Personalizar > Ações.
- **Atualize o software:** Configurações > Suporte > Atualização de Software.
- **Menos apps abertos ao mesmo tempo:** sair dos apps com **Voltar** (em vez de Home) costuma fechá-los de verdade.

## 4. Remover apps que você não usa

1. Abra **Apps** e entre nas configurações (ícone de engrenagem no canto superior direito da tela de Apps).
2. Selecione o app e escolha **Excluir**.

Apps que vêm de fábrica geralmente só podem ser **removidos da barra inicial**, não desinstalados.
Na barra do Smart Hub: selecione o app, aperte **▼** e escolha **Remover**.

Pelo PC, `tizen uninstall -p <ID do pacote> -t <dispositivo>` remove apenas apps que **você** instalou pelo
Modo Desenvolvedor. Apps de sistema da Samsung não podem ser removidos assim.

## 5. Menos propaganda e rastreamento

Em **Configurações > Suporte > Termos e Privacidade**:

- Desligue os **Serviços de informações de visualização**.
- Desligue os **Anúncios baseados em interesse**.
- Desligue os **Serviços de reconhecimento de voz**, se você não usa comandos de voz.

## O que não dá para fazer

- Trocar o Smart Hub da Samsung pelo launcher (a interface do sistema não pode ser substituída).
- Desinstalar apps de sistema ou mexer no bootloader. O firmware é assinado pela Samsung e não há um método
  público confirmado para este modelo; tentar pode inutilizar a TV.
