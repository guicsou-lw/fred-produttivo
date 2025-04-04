# Como configurar

## 1. Conectando à uma planilha Google Sheets
## Ativando a API
1. Vá ao https://console.cloud.google.com/apis/api/sheets.googleapis.com/metrics e ative a API
2. Gere uma nova credencial (em json)
3. Modifique o arquivo token.json com o json baixado de sua credencial

## Preparando a planilha
1. Crie uma nova planilha
2. Modifique o nome da Aba para "Historico" (sem acento mesmo)
3. Dê permissão de Editor ao email mostrado no json das credenciais do google (token.json): `client_email`

## Configurando localmente
1. Copie o ID da planilha: `https://docs.google.com/spreadsheets/d/<ID_DA_PLANILHA>/edit#gid=0`
2. Cole no .env correspondente (SPREADSHEET_ID)

Pronto, agora seu ambiente ja deve estar configurado para se conectar à planilha correta :D

## 2. Importando documentação REST
Use o arquivo da pasta /insomnia e importe as configurações la, ja vai ter tudo configurado e também algumas chamadas da API da RD Station.

## 3. Usando
* `/clearAll/<hash>`- Limpa a planilha
* `gm/<hash>` - Coleta os dados e adiciona à planilha (não sobrescreve dados existentes, apenas adiciona novos)
* `solar/<hash>` - Mesma coisa do GM, mas coleta de contas diferentes da RD Station

## 4. Adicionando uma nova conta
1. Mapear os funnels
2. Adicionar o controler
3. Adicionar o init
4. Configurar no Trigger do Google a chamada da nova conta

---

## Configurando o GOOGLE TOKEN no servidor
No servidor, o arquivo de token (token.json) não vêm por padrão, já que esse arquivo não é commitado, então colocamos ele nas variáveis de ambiente. É esperado que, no servidor, o token.json seja gerado automaticamente durante o build através da var de ambiente.

Para isso, estamos fazendo o encode de b64 do conteúdo do json e adicionando na variável de ambiente GOOGLE_TOKEN. Essa var não é relevante para rodar o projeto localmente pois podemos adicionar o arquivo `token.json` localmente, sem commitar ele. Mas como não temos o arquivo (e nem podemos ter) no repositório, precisamos criar ele no servidor durante o build.

* Pra criar a var de ambiente, usamos o encoding: `base64 /path/to/file`
* Pra decodar, usamos: `echo -n $GOOGLE_TOKEN | base64 --decode  > token.json`
