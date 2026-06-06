import os
import sys
import time
import argparse
import pandas as pd
from dotenv import load_dotenv
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException

# Constantes de segmentación fijas para España y Español
SPAIN_GEO_ID = "2724"  # geoTargetConstants/2724
SPANISH_LANG_ID = "1003"  # languageConstants/1003

def get_competition_level_name(client, competition_level):
    """Obtiene el nombre legible de la competencia desde el enum de Google Ads."""
    try:
        return competition_level.name
    except AttributeError:
        try:
            return client.enums.KeywordPlanCompetitionLevelEnum(competition_level).name
        except Exception:
            return str(competition_level)

def format_monthly_searches(monthly_search_volumes):
    """Formatea la lista de volúmenes de búsqueda mensuales en una sola cadena estructurada."""
    if not monthly_search_volumes:
        return ""
    
    volumes = []
    for vol in monthly_search_volumes:
        month_val = vol.month
        month_num = None
        
        # Mapear desde el enum
        if hasattr(month_val, "name"):
            month_name = month_val.name
            month_map = {
                "JANUARY": 1, "FEBRUARY": 2, "MARCH": 3, "APRIL": 4, "MAY": 5, "JUNE": 6,
                "JULY": 7, "AUGUST": 8, "SEPTEMBER": 9, "OCTOBER": 10, "NOVEMBER": 11, "DECEMBER": 12
            }
            month_num = month_map.get(month_name)
            
        if month_num is None:
            try:
                val = int(month_val)
                # En Google Ads, MonthOfYear enum tiene JANUARY = 2, FEBRUARY = 3, etc.
                if 2 <= val <= 13:
                    month_num = val - 1
                else:
                    month_num = val
            except Exception:
                month_num = str(month_val)
                
        month_str = f"{month_num:02d}" if isinstance(month_num, int) else str(month_num)
        year_str = str(vol.year)
        searches = vol.monthly_searches if vol.monthly_searches is not None else 0
        volumes.append(f"{year_str}-{month_str}: {searches}")
        
    return "; ".join(volumes)

def main():
    parser = argparse.ArgumentParser(description="Investigación de Palabras Clave por Google Ads API para España.")
    parser.add_index = False
    parser.add_argument("--url", nargs="?", const="https://www.tutormatepro.com/", type=str,
                        help="URL para extraer ideas adicionales (ej: https://www.tutormatepro.com/)")
    parser.add_argument("--no-seeds", action="store_true",
                        help="Deshabilita la consulta de palabras clave del archivo keywords_seed.txt")
    args = parser.parse_args()

    # Cargar variables del .env
    script_dir = os.path.dirname(os.path.abspath(__file__))
    env_path = os.path.join(script_dir, '.env')
    
    if os.path.exists(env_path):
        load_dotenv(env_path)
    else:
        load_dotenv()

    # Verificar variables requeridas
    required_vars = [
        "GOOGLE_ADS_DEVELOPER_TOKEN",
        "GOOGLE_ADS_CLIENT_ID",
        "GOOGLE_ADS_CLIENT_SECRET",
        "GOOGLE_ADS_REFRESH_TOKEN",
        "GOOGLE_ADS_CUSTOMER_ID"
    ]
    
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        print("\n[ERROR: CONFIGURACIÓN INCOMPLETA]")
        print("Faltan las siguientes variables en tu archivo .env:")
        for var in missing_vars:
            print(f"- {var}")
        print("\nPor favor, configura tu archivo .env correctamente antes de ejecutar el script.")
        sys.exit(1)

    customer_id = os.getenv("GOOGLE_ADS_CUSTOMER_ID").replace("-", "").strip()
    login_customer_id = os.getenv("GOOGLE_ADS_LOGIN_CUSTOMER_ID")

    # Configuración de credenciales para Google Ads API
    google_ads_config = {
        "developer_token": os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN"),
        "client_id": os.getenv("GOOGLE_ADS_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_ADS_CLIENT_SECRET"),
        "refresh_token": os.getenv("GOOGLE_ADS_REFRESH_TOKEN"),
        "use_proto_plus": True
    }
    
    if login_customer_id:
        google_ads_config["login_customer_id"] = login_customer_id.replace("-", "").strip()

    # Inicializar cliente de Google Ads
    try:
        client = GoogleAdsClient.load_from_dict(google_ads_config)
        keyword_plan_idea_service = client.get_service("KeywordPlanIdeaService")
    except Exception as e:
        print(f"Error al inicializar el cliente de Google Ads API: {e}")
        sys.exit(1)

    # Cargar palabras clave semilla desde keywords_seed.txt
    grouped_keywords = {}
    total_seeds = 0
    
    if not args.no_seeds:
        seed_file_path = os.path.join(script_dir, "keywords_seed.txt")
        if not os.path.exists(seed_file_path):
            print(f"Advertencia: No se encontró el archivo de semillas '{seed_file_path}'. Se omitirá la carga de palabras clave semilla.")
        else:
            current_group = "General"
            with open(seed_file_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    if line.endswith(":"):
                        current_group = line[:-1].strip()
                        grouped_keywords[current_group] = []
                    else:
                        if current_group not in grouped_keywords:
                            grouped_keywords[current_group] = []
                        grouped_keywords[current_group].append(line)
                        total_seeds += 1

    # Imprimir resumen de inicio
    print("="*60)
    print("INICIANDO CONSULTA A GOOGLE ADS KEYWORD PLANNER")
    print("="*60)
    print(f"Customer ID usado: {customer_id}")
    if login_customer_id:
        print(f"Login Customer ID (Manager) usado: {login_customer_id}")
    print("País usado: España (geoTargetConstants/2724)")
    print("Idioma usado: Español (languageConstants/1003)")
    print(f"Número de keywords semilla: {total_seeds}")
    if args.url:
        print(f"URL de extracción de ideas: {args.url}")
    print("-"*60)

    # Diccionario para agregar ideas únicas
    aggregated_ideas = {}

    # Función auxiliar para consultar ideas y rellenar el agregador
    def fetch_and_aggregate(seed_type, group_name=None, keywords=None, url=None):
        request = client.get_type("GenerateKeywordIdeasRequest")
        request.customer_id = customer_id
        request.language = f"languageConstants/{SPANISH_LANG_ID}"
        request.geo_target_constants.append(f"geoTargetConstants/{SPAIN_GEO_ID}")
        request.keyword_plan_network = client.enums.KeywordPlanNetworkEnum.GOOGLE_SEARCH
        
        source_label = ""
        if seed_type == "keyword" and keywords:
            request.keyword_seed.keywords.extend(keywords)
            source_label = f"Group: {group_name}"
        elif seed_type == "url" and url:
            request.url_seed.url = url
            source_label = f"URL: {url}"
        
        try:
            response = keyword_plan_idea_service.generate_keyword_ideas(request=request)
            ideas_added = 0
            for result in response.results:
                kw = result.text
                metrics = result.keyword_idea_metrics
                
                avg_searches = metrics.avg_monthly_searches if metrics else None
                comp = get_competition_level_name(client, metrics.competition) if metrics else None
                comp_idx = metrics.competition_index if metrics else None
                low_bid = metrics.low_top_of_page_bid_micros / 1_000_000.0 if (metrics and metrics.low_top_of_page_bid_micros is not None) else None
                high_bid = metrics.high_top_of_page_bid_micros / 1_000_000.0 if (metrics and metrics.high_top_of_page_bid_micros is not None) else None
                monthly_volumes = format_monthly_searches(metrics.monthly_search_volumes) if metrics else None
                
                if kw not in aggregated_ideas:
                    aggregated_ideas[kw] = {
                        "keyword": kw,
                        "average_monthly_searches": avg_searches,
                        "competition": comp,
                        "competition_index": comp_idx,
                        "low_top_of_page_bid_eur": low_bid,
                        "high_top_of_page_bid_eur": high_bid,
                        "monthly_search_volumes": monthly_volumes,
                        "source_seed": source_label,
                        "country": "Spain",
                        "language": "Spanish"
                    }
                else:
                    existing_sources = aggregated_ideas[kw]["source_seed"].split(", ")
                    if source_label not in existing_sources:
                        aggregated_ideas[kw]["source_seed"] += f", {source_label}"
                ideas_added += 1
            return ideas_added
        except GoogleAdsException as ex:
            print(f"\n[ERROR DE GOOGLE ADS API]")
            print(f"Request ID: {ex.request_id}")
            for error in ex.failure.errors:
                error_code = error.error_code
                message = error.message
                print(f"- Código de error: {error_code}")
                print(f"  Detalle del mensaje: {message}")
                
                err_str = str(error_code).upper()
                if "DEVELOPER_TOKEN" in err_str:
                    print("\n  👉 SUGERENCIA: Tu Developer Token de Google Ads es inválido o no está aprobado.")
                    print("     Asegúrate de copiarlo de la cuenta de producción del centro de la API de Google Ads.")
                elif "NOT_ADS_USER" in err_str or "PERMISSION_DENIED" in err_str:
                    print("\n  👉 SUGERENCIA: La cuenta de autenticación no tiene acceso a este Customer ID.")
                    print("     Verifica si el GOOGLE_ADS_CUSTOMER_ID es de una cuenta a la que tu OAuth tiene acceso.")
                    print("     Si es una subcuenta bajo una cuenta de administrador, define GOOGLE_ADS_LOGIN_CUSTOMER_ID en el .env.")
                elif "BILLING_ERROR" in err_str:
                    print("\n  👉 SUGERENCIA: Hay un problema de facturación (Billing) con la cuenta administradora o de consulta.")
                    print("     Asegúrate de que la cuenta asociada tiene facturación configurada.")
            sys.exit(1)
        except Exception as e:
            print(f"Error inesperado al consultar ideas: {e}")
            sys.exit(1)

    # 1. Consultar ideas por grupos de palabras clave semilla
    for group_name, keywords in grouped_keywords.items():
        if not keywords:
            continue
        
        # Dado que la API tiene un límite estricto de 20 palabras clave semilla por consulta,
        # dividimos las palabras clave de cada grupo en lotes de tamaño máximo 20 (aunque nuestras listas son pequeñas)
        batch_size = 20
        for i in range(0, len(keywords), batch_size):
            batch = keywords[i:i+batch_size]
            print(f"Consultando ideas para grupo '{group_name}' [Lote {i//batch_size + 1}] con {len(batch)} palabras clave semilla...")
            num_results = fetch_and_aggregate("keyword", group_name=group_name, keywords=batch)
            print(f"-> Obtenidas {num_results} ideas sugeridas.")
            
            # Respetar rate limits de la API (1 QPS recomendado para servicios de planeación)
            time.sleep(1.2)

    # 2. Consultar ideas por URL si fue especificada
    if args.url:
        print(f"Consultando ideas usando la URL como semilla: {args.url}...")
        num_results = fetch_and_aggregate("url", url=args.url)
        print(f"-> Obtenidas {num_results} ideas sugeridas.")

    # Guardar resultados
    if not aggregated_ideas:
        print("\nNo se obtuvieron ideas de palabras clave. No se generaron archivos de salida.")
        return

    # Convertir a DataFrame y ordenar por búsquedas mensuales de manera descendente
    df = pd.DataFrame(aggregated_ideas.values())
    df.sort_values(by="average_monthly_searches", ascending=False, inplace=True)

    # Crear carpeta outputs si no existe
    outputs_dir = os.path.join(script_dir, "outputs")
    os.makedirs(outputs_dir, exist_ok=True)
    
    csv_path = os.path.join(outputs_dir, "keyword_research_spain.csv")
    xlsx_path = os.path.join(outputs_dir, "keyword_research_spain.xlsx")

    # Exportar a CSV e Excel
    df.to_csv(csv_path, index=False, encoding="utf-8-sig")
    df.to_excel(xlsx_path, index=False)

    print("\n" + "="*60)
    print("PROCESO COMPLETADO EXITOSAMENTE")
    print("="*60)
    print(f"Número de ideas obtenidas: {len(df)}")
    print(f"Ruta del CSV: {csv_path}")
    print(f"Ruta del XLSX: {xlsx_path}")
    print("="*60)

if __name__ == "__main__":
    main()
