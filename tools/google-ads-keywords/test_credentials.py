import os
import sys
from dotenv import load_dotenv
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException

def main():
    # Cargar variables del .env
    script_dir = os.path.dirname(os.path.abspath(__file__))
    env_path = os.path.join(script_dir, '.env')
    
    if os.path.exists(env_path):
        load_dotenv(env_path)
    else:
        load_dotenv()

    print("="*60)
    print("VERIFICADOR DE CREDENCIALES DE GOOGLE ADS API")
    print("="*60)

    required_vars = [
        "GOOGLE_ADS_DEVELOPER_TOKEN",
        "GOOGLE_ADS_CLIENT_ID",
        "GOOGLE_ADS_CLIENT_SECRET",
        "GOOGLE_ADS_REFRESH_TOKEN"
    ]
    
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        print("\n[CONFIGURACIÓN INCOMPLETA]")
        print("Faltan las siguientes variables en tu archivo .env:")
        for var in missing_vars:
            print(f"- {var}")
        print("\nPor favor, copia .env.example a .env y rellena las variables requeridas.")
        sys.exit(1)

    # Configuración del cliente
    google_ads_config = {
        "developer_token": os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN"),
        "client_id": os.getenv("GOOGLE_ADS_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_ADS_CLIENT_SECRET"),
        "refresh_token": os.getenv("GOOGLE_ADS_REFRESH_TOKEN"),
        "use_proto_plus": True
    }
    
    login_customer_id = os.getenv("GOOGLE_ADS_LOGIN_CUSTOMER_ID")
    if login_customer_id:
        google_ads_config["login_customer_id"] = login_customer_id.replace("-", "").strip()

    try:
        # Inicializar el cliente
        client = GoogleAdsClient.load_from_dict(google_ads_config)
        customer_service = client.get_service("CustomerService")
        
        print("Intentando establecer conexión y listar cuentas asociadas...")
        response = customer_service.list_accessible_customers()
        
        print("\n" + "="*60)
        print("¡CONEXIÓN EXITOSA!")
        print("="*60)
        print("Cuentas de Google Ads accesibles con este token OAuth:")
        for resource_name in response.resource_names:
            customer_id = resource_name.split("/")[-1]
            print(f" - Customer ID: {customer_id} ({resource_name})")
            
        print("\n[INFORMACIÓN DE ACCESO]")
        print("- Si tu Developer Token es de tipo 'Test Account', recuerda que solo puedes")
        print("  consultar cuentas de prueba (Test Accounts). El script principal de palabras")
        print("  clave fallará si intentas consultar una cuenta real de producción.")
        print("- Una vez que Google apruebe el Basic Access, podrás cambiar el Customer ID")
        print("  en tu .env por el de tu cuenta de producción real y funcionará inmediatamente.")
        print("="*60)

    except GoogleAdsException as ex:
        print("\n" + "="*60)
        print("[ERROR EN LA API DE GOOGLE ADS]")
        print("="*60)
        print(f"Request ID: {ex.request_id}")
        for error in ex.failure.errors:
            error_code = error.error_code
            message = error.message
            print(f"- Código de error: {error_code}")
            print(f"  Detalle del mensaje: {message}")
            
            err_str = str(error_code).upper()
            if "DEVELOPER_TOKEN_NOT_APPROVED" in err_str:
                print("\n👉 EXPLICACIÓN: Tu Developer Token está en estado 'Test Account' o pendiente de aprobación.")
                print("   Si estás intentando conectarte a una cuenta real de producción, el acceso será rechazado.")
                print("   Asegúrate de que estás usando un Customer ID de una cuenta de prueba (Test Manager/Client).")
            elif "NOT_ADS_USER" in err_str or "PERMISSION_DENIED" in err_str:
                print("\n👉 EXPLICACIÓN: El usuario autenticado mediante OAuth no tiene permisos para")
                print("   acceder a este recurso, o falta especificar el 'GOOGLE_ADS_LOGIN_CUSTOMER_ID' si es")
                print("   una subcuenta bajo una cuenta administradora (Manager Account).")
        print("="*60)
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR INESPERADO]: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
