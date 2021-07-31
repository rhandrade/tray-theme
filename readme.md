# Tray Theme
Interface de linha de comando desenvolvida em Node.js e TypeScript para ajudar desenvolvedores a criarem ótimos temas para Tray.

> **Atenção**
> Esse programa está em fase de desenvolvimento e portanto não garantimos o correto funcionamento. Ajude-nos reportando problemas ao utilizá-lo.

## Instalação
Para usar esse programa basta instalar com os comandos abaixo. Recomendados fazer a instalação global.
```sh
# Instala globalmente no sistema (Recomendado)
npm install tray-theme --global

# Instala na pasta local
npm install tray-theme
```

Se desejar não fazer a instalação global, todos os comando abaixo precisaram ter acrescido `npx` antes para que ele seja executado da instalação local.


## Etapas do projeto
Esse projeto será divido em várias etapas. Você pode conferir a progresso pelos itens abaixo:

- [x] Mapear URLs básicas do Opencode
- [x] Mapear funções do CLI
- [x] Implementar SDK JS para Opencode
- [x] Implementar comandos do CLI
- [x] Lançar versão 1.0-alpha no npm
- [ ] Melhorar estrutura do projeto
- [ ] Separar comandos em arquivos próprios
- [ ] Melhorar comunicação das mensagens
- [ ] Melhorar detecção e tratamento de erros
- [ ] Realizar testes em multiplas versões do Node.js
- [ ] Realizar testes em vários sistemas operacionais
- [ ] Versão 1.0-beta
- [ ] Versão 1.0 final


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

- `key` - Chave de autorizaçào ao opencode
- `password` - Senha de autorizaçào ao opencode
- `theme_name` - Nome que deseja dar ao tema
- `theme_base` - Tema no qual o novo tema será baseado.


### tray clean_cache [theme_base]
Limpa os caches de um tema. Se o parâmetro `theme_base` não for informado, o programa limpará o cache do tema configurado, caso contrário do tema informado.


### tray delete_theme <theme_id>
Delete o tema informado. Esse comando precisa de confirmação para ser executado. Por padrão ao dar o Enter ao ser perguntado o comando será abortado. Precise Y para confirmar a exclusão. **Atenção!** essa operação não poderá ser desfeita.


### tray download [files...]
Baixa os arquivos do tema. O parâmetro `files` pode receber vários arquivos, basta separá-los com espaço. Se nenhum arquivo for específicado todos os arquivos do tema são baixados.

```sh
# Baixa todos os arquivos do tema
tray download

# Baixa somente os arquivos footer.html e header.html da pasta elements
tray download elements/footer.html elements/header.html
```


### tray upload [files...]
Envia os arquivos do tema para os servidores da Tray. O parâmetro `files` pode receber vários arquivos, basta separá-los com espaço. Se nenhum arquivo for específicado todos os arquivos do tema são enviados.

```sh
# Envia todos os arquivos do tema
tray upload

# Envia somente os arquivos footer.html e header.html da pasta elements
tray upload elements/footer.html elements/header.html
```


### tray delete-file <files...>
Delete os arquivos solicitados dos servidores da Tray. O parâmetro `files` pode receber um ou vários arquivos, basta separá-los com espaço.


### tray rm <files...>
Alias para `tray delete-file <files...>`


### tray watch
Observa a pasta atual do projeto para identificar mudanças nos arquivos e envia-los aos servidores da Tray. Suporta o envio ao colar novos arquivos na pasta do projeto, sem a necessidade de modificá-los.

Apesar do programa suportar todas as operações que o sistema permite, nem todas são suportadas pela API da Tray. Veja abaixo quais operações são permitidas:

**Suportado**
- Criação de arquivos
- Remoção de arquivos
- Modificação de arquivos

**Não suportados**
- Criação de pastas vazias
- Remoção de pastas


### tray open
Abre a url de preview do tema no navegador padrão.
