import os
import sys
from dotenv import load_dotenv

try:
    from google_auth_oauthlib.flow import InstalledAppFlow
except ImportError:
    print("Error: El paquete 'google-auth-oauthlib' no está instalado.")
    print("Por favor, asegúrate de instalar las dependencias con: pip install google-auth-oauthlib python-dotenv")
    sys.exit(1)

def main():
    # Cargar variables desde el archivo .env en la misma carpeta o ruta del script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    env_path = os.path.join(script_dir, '.env')
    
    # También intentar cargar desde el directorio actual de ejecución por si acaso
    if os.path.exists(env_path):
        load_dotenv(env_path)
    else:
        load_dotenv()
    
    client_id = os.getenv("GOOGLE_ADS_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_ADS_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        print("Error: GOOGLE_ADS_CLIENT_ID y GOOGLE_ADS_CLIENT_SECRET deben estar definidos en el archivo .env.")
        print("Por favor, copia .env.example a .env, rellena esas dos variables y vuelve a intentarlo.")
        sys.exit(1)
        
    print(f"Iniciando flujo de autorización OAuth 2.0...")
    print(f"Cliente ID detectado: {client_id[:15]}... (truncado)")
    
    # Estructura de configuración esperada por InstalledAppFlow
    client_config = {
        "installed": {
            "client_id": client_id,
            "client_secret": client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    }
    
    # El scope de Google Ads API es obligatorio
    scopes = ["https://www.googleapis.com/auth/adwords"]
    
    try:
        # Inicializar el flujo usando la configuración de cliente cargada desde .env
        flow = InstalledAppFlow.from_client_config(client_config, scopes=scopes)
        
        # Ejecutar servidor local para capturar la redirección OAuth automáticamente
        credentials = flow.run_local_server(
            port=0,
            authorization_prompt_message="Por favor, visita esta URL para autorizar la aplicación:\n{url}",
            success_message="¡Autorización completada con éxito! Ya puedes cerrar esta ventana y regresar a la terminal.",
            open_browser=True
        )
        
        print("\n" + "="*50)
        print("¡CREDENCIALES OBTENIDAS CON ÉXITO!")
        print("="*50)
        print(f"GOOGLE_ADS_REFRESH_TOKEN={credentials.refresh_token}")
        print("="*50)
        print("\nCopia la línea anterior completa y pégala en tu archivo .env.")
        
    except Exception as e:
        print(f"\nOcurrió un error durante la autenticación: {e}")
        print("\nConsejos para resolverlo:")
        print("1. En Google Cloud Console, asegúrate de que el tipo de credencial sea 'Aplicación de escritorio' (Desktop app).")
        print("2. Asegúrate de configurar la Pantalla de consentimiento OAuth como tipo 'Externo' y en estado 'Prueba'.")
        print("3. Asegúrate de añadir tu propio correo electrónico de Google en la lista de 'Usuarios de prueba' de la pantalla de consentimiento OAuth.")

if __name__ == "__main__":
    main()
