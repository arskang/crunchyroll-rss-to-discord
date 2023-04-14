# Crunchyroll RSS to Discord

El cron job se ejecuta cada 10 minutos

### Comandos
- Instalaciones:
  - [Node](https://nodejs.org/es)
  - [Yarn](https://yarnpkg.com/)
- Instalar dependencias: ```yarn```
- Ejecutar desarrollo: ```yarn run start:dev```
- Producción: ```yarn build```

### Environments

Crear archivo ```.env``` en la raíz del proyecto con las siguientes variables:

- **PORT**: puerto del servidor
- **LOGGER**: si quieren mandar los logs a la consola: true
- **DISCORD_WEBHOOK**: link del webhook en Discrod
- **MINUTES**: define cada cuantos minutos se ejecutara el cron. *Valor predeterminado: 30*
- **LAST_MINUTES**: define los minutos para filtrar las noticias, por ejemplo: 60 minutos antes de la fecha actual. *Valor predeterminado: 60*
- **CRONOFF**: si no se quiere utilizar el cron: true

### Endpoints

- ```{domain}/version```
- ```{domain}/crunchyroll/news```: en caso de querer ejecutar la consulta al RSS de Crunchyroll

### Funcionamiento

1. Al iniciar el servidor se genera una base de datos con sqlite (en caso de que no exista) para registrar las noticias ya enviadas
2. Se inicializa el cronjob para que se repita cada ```MINUTES``` minutos
3. Al ejecutarse el servicio se realiza una consulta al RSS de Crunchyroll (siempre devuelve los últimos 100 registros)
4. Se filtra la información que se haya publicado en los últimos ```LAST_MINUTES``` minutos
5. Se hace una consulta para traer las noticias que están registradas como enviadas
6. Se borran las que ya no entran en el rango de fechas (para evitar la acumulación de información)
7. Se vuelve a filtrar para solo obtener las que aún no se han enviado
8. Se formatea el objeto para enviar hasta 10 noticias (embeds) por mensaje
9. Se envían los mensajes a Discord (```DISCORD_WEBHOOK```) y se guardan los ids enviados (los ids solo se guardan si la respuesta de Discord no provoca un error)