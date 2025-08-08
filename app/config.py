import os
from dotenv import load_dotenv

load_dotenv()

ENV=os.getenv("ENV", "DEV")
API_BASE_URL=os.getenv("API_BASE_URL", "https://vapp-dev-som-01.msc01.nonprod.dot.ga.gov/api/v1")
