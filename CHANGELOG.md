# Changelog
Documentação para especificar toda as alterações de sistema.

## 20/12/2022
### RD Station v2
* Não consegui encontrar nenhuma referencia à V2 da API do CRM do RD Station
* Porém, consegui encontrar alterações de versão do RDSM (RD Station Marketing), onde este possui a v1 e a v2, além de alterações grandes na autenticação
* Apesar disso, fiz um "cara-crachá" da documentação atual () com o código e fiz as alterações cabíveis. Portanto, agora estamos 100% atualizados com a versão mais recente da api.
* Além da documentação, também entrei em contato com o time de suporte da RD, que me confirmou que a api do CRM não tem uma v2 e que, se tiver tudo atualizado conforme a documentação de referencia, então estamos bem.

### Adição de campos novos
* _Cidade Organização_

### Modificação de campos existentes
* _Cidade_ -> _Cidade Oportunidade_

### Alterações extras
* Atualização automatica do header da planilha
* Avaliação do problema onde não estamos conseguindo coletar a Cidade da _oportunidade_: Acontece que os dados do RD não possuem o campo customizado "Cidade" em seus registros, apenas as _organizações_ possuem esse campo. Para corrigir esse problema, precisamos que a cidade passe a ser adicionada à _oportunidade_ como campo customizado ao coletar dados e enviar para o RD.
* Coleta da Cidade da organização: Para mitigar o problema citado acima, alteramos o nome do campo "Cidade" para "Cidade Oportunidade" e adicionamos o campo "Cidade Organização"
* Documentação para conexão com uma planilha de testes (para não usar as coisas da prod em novos desenvolvimentos)
* Documentação de endpoints (tanto RD Station API quanto do sistema) via insomnia
* Criação deste changelog

## Log de alteração de campos
Gerado em: https://www.tablesgenerator.com/markdown_tables

| Nome do Campo      | Açao              | Valor Atual         | Valor Anterior | Data de alteraçao | Autor            |
|--------------------|-------------------|---------------------|----------------|-------------------|------------------|
| Cidade             | Alteraçao de nome | Cidade Oportunidade | Cidade         | 20/12/2022        | guicsou@lupit.io |
| Cidade Organizaçao | Inclusao de campo | Cidade Organizaçao  | -              | 20/12/2022        | guicsou@lupit.io |
|                    |                   |                     |                |                   |                  |