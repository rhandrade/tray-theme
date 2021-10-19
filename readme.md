# Tray Theme

[![npm](https://img.shields.io/npm/v/tray-theme?logo=npm&style=flat-square)](https://www.npmjs.com/package/tray-theme)
![node-current](https://img.shields.io/node/v/tray-theme?logo=node.js&logoColor=%23fff&style=flat-square)
[![npm downloads](https://img.shields.io/npm/dm/tray-theme?style=flat-square)](http://npm-stat.com/charts.html?package=tray-theme)

Interface de linha de comando desenvolvida em Node.js e TypeScript para ajudar desenvolvedores a criarem ótimos temas para Tray.

## Índice

-   [Instalação](#instalação)
-   [Roadmap](#roadmap)
-   [Comandos disponíveis](#comandos-disponíveis)
    -   [tray help [command]](#tray-help-command)
    -   [tray configure [key] [password] [theme_id]](#tray-configure-key-password-theme_id)
    -   [tray themes](#tray-themes)
    -   [tray new \<key\> \<password\> \<theme_name\> [theme_base]](#tray-new-key-password-theme_name-theme_base)
    -   [tray clean-cache [theme_base]](#tray-clean-cache-theme_base)
    -   [tray delete-theme <theme_id>](#tray-delete-theme-theme_id)
    -   [tray download [files...]](#tray-download-files)
    -   [tray upload [files...]](#tray-upload-files)
    -   [tray delete-file <files...>](#tray-delete-file-files)
    -   [tray rm <files...>](#tray-rm-files)
    -   [tray watch](#tray-watch)
    -   [tray open](#tray-open)
-   [Contribuidores](#contribuidores)
-   [Créditos](#créditos)
-   [Licença](#licença)

## Instalação

Para usar esse programa basta instalar com os comandos abaixo. Recomendados fazer a instalação global.

```sh
# Instala globalmente no sistema (Recomendado)
npm install tray-theme --global

# Instala na pasta local
npm install tray-theme
```

Se desejar não fazer a instalação global, todos os comando abaixo precisaram ter acrescido `npx` antes para que ele seja executado da instalação local.

## Roadmap

Acompanhe a evolução do projeto através das issues e das milestones definidas [nessa página](https://github.com/rhandrade/tray-theme/milestones).

## Comandos disponíveis

Os comandos abaixo estão disponíveis no programa. Todos eles se iniciam pela palavra `tray`. Parâmetros obrigatórios são indicados entre maior/menor (<>) e parâmetros opcionais entre colchetes ([]).

### tray help [command]

Mostra a mensagem de ajuda e todos os commandos disponíveis. Se o parâmetro `command` for passado mostra a ajuda apenas para aquele comando.

### tray configure [key] [password] [theme_id]

Cria o arquivo de configuração. Caso não passe os parâmetros acima o programa irá pedí-los.

### tray themes

Lista todos os temas disponíveis. Os temas serão exibidos em formato de tabela.

**Atenção:** o opencode online não remove os temas, apenas os marca como removido. Por isso esse irá exibir todos os temas, mesmo que eles não apareçam mais no site.

### tray new \<key\> \<password\> \<theme_name\> [theme_base]

Cria um novo tema na plataforma.

-   `key` - Chave de autorizaçào ao opencode
-   `password` - Senha de autorizaçào ao opencode
-   `theme_name` - Nome que deseja dar ao tema
-   `theme_base` - Tema no qual o novo tema será baseado.

### tray clean-cache [theme_base]

Limpa os caches de um tema. Se o parâmetro `theme_base` não for informado, o programa limpará o cache do tema configurado, caso contrário do tema informado.

### tray delete-theme <theme_id>

Delete o tema informado. Esse comando precisa de confirmação para ser executado. Por padrão ao dar o Enter ao ser perguntado o comando será abortado. Precise Y para confirmar a exclusão. **Atenção!** essa operação não poderá ser desfeita.

### tray download [files...]

Baixa os arquivos do tema. O parâmetro `files` pode receber vários arquivos, basta separá-los com espaço. Se nenhum arquivo for específicado todos os arquivos do tema são baixados.

```sh
# Baixa todos os arquivos do tema
tray download

# Baixa somente os arquivos footer.html e header.html da pasta elements
tray download elements/footer.html elements/header.html
```

### tray upload [options] [files...]

Envia os arquivos do tema para os servidores da Tray. O parâmetro `files` pode receber vários arquivos, basta separá-los com espaço. Se nenhum arquivo for específicado todos os arquivos do tema são enviados.

Esse comando também aceita opções que modificam o comportamento do comando. A única opção disponível é a `-c` ou sua versão extendida `--core`. Com isso, somente os arquivos principais são enviados, ou seja, desconsidera o arquivo `settings.json` e a pasta de imagens. **Atenção:** essa opção não pode ser usada em conjunto com o parâmetro `files`. Caso os dois sejam usados, um erro será retornado.

```sh
# Envia todos os arquivos do tema
tray upload

# Envia somente os arquivos footer.html e header.html da pasta elements
tray upload elements/footer.html elements/header.html

# Envia somente os arquivos principais do tema, sem imagens ou configurações do tema
tray upload -c
tray upload --core
```

### tray delete-file <files...>

Delete os arquivos solicitados dos servidores da Tray. O parâmetro `files` pode receber um ou vários arquivos, basta separá-los com espaço.

### tray rm <files...>

Alias para `tray delete-file <files...>`

### tray watch

Observa a pasta atual do projeto para identificar mudanças nos arquivos e envia-los aos servidores da Tray. Suporta o envio ao colar novos arquivos na pasta do projeto, sem a necessidade de modificá-los.

Apesar do programa suportar todas as operações que o sistema permite, nem todas são suportadas pela API da Tray. Veja abaixo quais operações são permitidas:

**Suportado**

-   Criação de arquivos
-   Remoção de arquivos
-   Modificação de arquivos

**Não suportados**

-   Criação de pastas vazias
-   Remoção de pastas

### tray open

Abre a url de preview do tema no navegador padrão.

## Contribuidores

Esse projeto foi criado a partir do desejo da comunidade de desenvolvedores da Tray por um CLI mais atualizado e responsivo. Obrigado a todos que contribuem com o desenvolvimento do projeto, seja reportando problemas, melhorias ou enviando códigos 🙂🎉.

Agradecimento especial a [Netzee - Agência de E-commerce](https://www.netzee.com.br) por fornecer acesso a plataforma Tray e ter permitido o surgimento desse projeto.

## Créditos

Criado por [Rafael Andrade](https://github.com/rhandrade/).

## Licença

[MIT](license.md)
