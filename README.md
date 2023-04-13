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
- **LOGGER**: true para mandar los logs a la consola
- **DISCORD_WEBHOOK**: link del webhook en Discrod
- **LOCAL_DB**: string de la conexión a una base de datos Postgree
- **MINUTES**: cada cuantos minutos se ejecutara el cron, default 10

### Endpoints

- ```{domain}/version```
- ```{domain}/crunchyroll/news```: en caso de querer ejecutar la consulta al RSS de Crunchyroll