# Planificador de Palabras Clave de Google Ads API (España)

Este módulo proporciona una herramienta en Python para consultar ideas y métricas históricas de palabras clave directamente desde la **Google Ads API** para el mercado de **España** (Idioma: Español, Red: Google Search). 

Este sistema consulta de forma directa las ideas del planificador de palabras clave sin crear campañas, sin modificar tus anuncios y **sin gastar dinero**.

---

## Estructura de Archivos
* `keyword_research_spain.py`: Script principal que realiza las consultas a la API y exporta las métricas a CSV e Excel.
* `test_credentials.py`: Script auxiliar para comprobar que tu Developer Token y credenciales OAuth se conectan correctamente.
* `get_refresh_token.py`: Script auxiliar para obtener el código OAuth de refresco (`refresh_token`) necesario para autorizar las solicitudes.
* `keywords_seed.txt`: Archivo de palabras clave semilla ordenadas por categorías (ESO, Bachillerato, Universidad, etc.).
* `requirements.txt`: Dependencias de Python requeridas.
* `.env.example`: Plantilla para configurar tus credenciales de Google Ads de forma segura.

---

## Requisitos Previos e Instalación

1. **Instalar Dependencias de Python**
   Abre una terminal y ejecuta el siguiente comando desde esta carpeta:
   ```bash
   pip install -r requirements.txt
   ```
   *(También se instalarán `google-auth-oauthlib` y `google-auth` como dependencias internas de `google-ads`)*.

2. **Crear archivo `.env`**
   Copia el archivo `.env.example` y nómbralo `.env`:
   ```bash
   cp .env.example .env
   ```

---

## Guía Paso a Paso para Conseguir las Credenciales

Para conectar este script con tu cuenta real de Google Ads y rellenar el archivo `.env`, debes seguir estos pasos:

### Paso 1: Obtener tu Google Ads Customer ID
1. Inicia sesión en tu cuenta de [Google Ads](https://ads.google.com/).
2. En la esquina superior derecha, verás un número con formato de 10 dígitos (ej: `123-456-7890`). Este es tu **Customer ID**.
3. Cópialo y pégalo en tu `.env` como:
   `GOOGLE_ADS_CUSTOMER_ID=1234567890` *(remueve los guiones)*.
4. **Nota sobre Manager Accounts:** Si tu cuenta es una cuenta de administrador (Manager Account), tu Customer ID de administrador va en `GOOGLE_ADS_LOGIN_CUSTOMER_ID`, y el Customer ID de la cuenta específica de cliente que quieres consultar va en `GOOGLE_ADS_CUSTOMER_ID`. Si es una cuenta directa estándar, deja `GOOGLE_ADS_LOGIN_CUSTOMER_ID` vacío.

### Paso 2: Solicitar el Developer Token
1. Inicia sesión en tu cuenta de administrador de Google Ads (Manager Account).
   * *Nota: Para obtener un developer token, Google Ads requiere que lo solicites desde una cuenta Manager (Administrador). Si no tienes una, puedes crear una cuenta de administrador gratuita desde Google Ads.*
2. Ve a **Herramientas y Configuración** (icono de llave inglesa) > **Configuración** > **Centro de la API** (API Center).
3. Allí verás tu **Developer Token** generado automáticamente (o una opción para solicitar uno).
4. El token suele estar en uno de los siguientes niveles de acceso:
   * **Test Account (Cuenta de Prueba):** Si tu nivel de acceso es "Test Account", **solo podrás consultar cuentas de prueba** (Test Accounts) de Google Ads. Cualquier intento de consultar una cuenta real de producción fallará con un error del tipo `DEVELOPER_TOKEN_NOT_APPROVED`. Para realizar pruebas con este nivel de acceso, debes crear un Administrador de Pruebas (Test Manager Account) y una cuenta cliente de pruebas en Google Ads.
   * **Basic Access o superior:** Si planeas consultar volúmenes de búsqueda de cuentas de producción reales, debes solicitar un aumento de nivel a **Basic Access** (Acceso Básico) rellenando el formulario de Google en el propio Centro de la API de Google Ads.
5. Cópialo y pégalo en tu `.env` como:
   `GOOGLE_ADS_DEVELOPER_TOKEN=tu_developer_token_aqui`

### Paso 3: Crear el OAuth Client ID y Client Secret en Google Cloud
1. Entra a la consola de [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un nuevo proyecto (ej: "TutorMate Pro Keywords") o selecciona uno existente.
3. Habilita la API de Google Ads:
   * Ve a **APIs y Servicios** > **Biblioteca**.
   * Busca "Google Ads API" y haz clic en **Habilitar**.
4. Configura la Pantalla de Consentimiento OAuth:
   * Ve a **APIs y Servicios** > **Pantalla de consentimiento de OAuth**.
   * Elige tipo de usuario **Externo** (External) y haz clic en Crear.
   * Rellena el nombre de la aplicación y tu correo de soporte.
   * En la sección **Usuarios de prueba** (Test Users), añade **obligatoriamente** el correo electrónico con el que gestionas tu cuenta de Google Ads.
5. Crear las Credenciales OAuth:
   * Ve a **APIs y Servicios** > **Credenciales**.
   * Haz clic en **Crear credenciales** y selecciona **ID de cliente de OAuth** (OAuth Client ID).
   * En *Tipo de aplicación*, selecciona **Aplicación de escritorio** (Desktop app).
   * Ponle un nombre identificativo y haz clic en **Crear**.
6. Copia el **ID de cliente** (Client ID) y el **Secreto de cliente** (Client Secret) resultantes y pégalos en tu archivo `.env`:
   ```env
   GOOGLE_ADS_CLIENT_ID=tu_client_id_aqui
   GOOGLE_ADS_CLIENT_SECRET=tu_client_secret_aqui
   ```

### Paso 4: Generar el Refresh Token con `get_refresh_token.py`
Dado que no queremos guardar tu contraseña en texto plano, la API utiliza OAuth para darnos una llave persistente de acceso (`refresh_token`).
1. Asegúrate de tener cargados en tu `.env` el `GOOGLE_ADS_CLIENT_ID` y `GOOGLE_ADS_CLIENT_SECRET`.
2. Ejecuta el script auxiliar en la terminal:
   ```bash
   python get_refresh_token.py
   ```
3. Se abrirá una pestaña en tu navegador web pidiendo acceso a tu cuenta de Google:
   * Si te aparece una advertencia de "Google no ha verificado esta aplicación", haz clic en **Configuración Avanzada** y luego en **Ir a ... (no seguro)**. Esto es normal porque creaste el proyecto tú mismo y no está publicado oficialmente.
   * Selecciona la cuenta de Google Ads que configuraste como usuario de prueba y concede los permisos.
4. Una vez completado el flujo en el navegador, la pestaña te dirá que la autorización fue exitosa y puedes cerrarla.
5. Vuelve a la terminal y verás impreso tu **Refresh Token** en el formato:
   `GOOGLE_ADS_REFRESH_TOKEN=1//tu_refresh_token_aqui`
6. Copia esta línea completa y pégala en tu archivo `.env`.

---

## Paso 5: Probar la Conexión (`test_credentials.py`)
Antes de ejecutar la herramienta completa, puedes verificar que la API de Google Ads acepte tu token y tus credenciales:
```bash
python test_credentials.py
```
Este script intentará conectarse e imprimirá las cuentas accesibles (Customer IDs) vinculadas a tu cuenta.

### Nota Importante sobre Test Account (Acceso de Prueba) vs Producción:
* **Mientras tu Developer Token esté en estado "Test Account" (Acceso de Prueba):**
  * Solo podrás consultar cuentas de prueba (Test Accounts). Si pones el Customer ID de tu cuenta de producción en `GOOGLE_ADS_CUSTOMER_ID`, obtendrás el error `DEVELOPER_TOKEN_NOT_APPROVED`.
  * **Solución para pruebas:** Crea una cuenta administradora de pruebas (Test Manager Account) y una cuenta cliente de pruebas en Google Ads. Configura el Customer ID de esta cuenta cliente de pruebas en tu `.env`.
* **Una vez aprobado el Basic Access por Google:**
  * Podrás usar el Developer Token directamente con tu cuenta de producción real de TutorMate Pro. Solo tendrás que actualizar el `GOOGLE_ADS_CUSTOMER_ID` en tu `.env` con el ID de tu cuenta de producción. ¡Y listo!

---

## Cómo Ejecutar la Investigación de Palabras Clave

Una vez que tu archivo `.env` esté completo, puedes ejecutar el script de investigación de palabras clave.

### Opción A: Consultar por Palabras Clave Semilla (desde `keywords_seed.txt`)
Para procesar las palabras clave agrupadas por categorías del archivo `keywords_seed.txt`:
```bash
python keyword_research_spain.py
```

### Opción B: Consultar por URL (Sugerencias a partir del sitio web)
Para extraer ideas sugeridas basadas en el sitio web de TutorMate Pro:
```bash
python keyword_research_spain.py --url https://www.tutormatepro.com/
```

### Opción C: Consultar ÚNICAMENTE por URL (Ignorando `keywords_seed.txt`)
```bash
python keyword_research_spain.py --url https://www.tutormatepro.com/ --no-seeds
```

---

## Resultados y Verificación del Target (España)

Al finalizar la ejecución del script, se crearán dos archivos en una subcarpeta llamada `outputs`:
1. `outputs/keyword_research_spain.csv`
2. `outputs/keyword_research_spain.xlsx`

### ¿Cómo confirmar que el script está usando España y no Colombia?
El script está fuertemente configurado para asegurar que los datos pertenecen a España:
1. **Targeting de Ubicación Forzado:** En el código de `keyword_research_spain.py`, el parámetro de ubicación está establecido rígidamente con el ID de criterio de España `geoTargetConstants/2724`. No hay posibilidad de que Google Ads devuelva datos de Colombia u otra región.
2. **Idioma Forzado:** El idioma está rígidamente configurado como Español `languageConstants/1003`.
3. **Validación en los Datos:** Si abres cualquiera de los archivos exportados (`.csv` o `.xlsx`), verás que las últimas columnas contienen explícitamente:
   * **`country`**: `Spain`
   * **`language`**: `Spanish`
4. **Mensaje de Consola:** Al arrancar el script, se imprimirá un resumen en la pantalla que confirma los parámetros utilizados:
   ```text
   ============================================================
   INICIANDO CONSULTA A GOOGLE ADS KEYWORD PLANNER
   ============================================================
   Customer ID usado: 1234567890
   País usado: España (geoTargetConstants/2724)
   Idioma usado: Español (languageConstants/1003)
   ...
   ```
