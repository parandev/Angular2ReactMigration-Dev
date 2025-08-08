from pathlib import Path
from fastapi import APIRouter, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from jinja2 import (
    Environment,
    FileSystemLoader,
    TemplateNotFound,
    TemplateSyntaxError,
    UndefinedError,
)
from config import ENV, API_BASE_URL

# from app.config import get_settings, Settings
router = APIRouter()
# settings = get_settings()



# Get the absolute path to the frontend/dist directory
frontend_dist_path = Path(__file__).parent.parent.parent / "frontend" / "dist"

# Setup Jinja2 template engine
templates_env = Environment(loader=FileSystemLoader(frontend_dist_path))

# Mount static files for assets
router.mount("/assets", StaticFiles(directory=frontend_dist_path / "assets"), name="assets")

# @router.get("/", include_in_schema=False)
# async def serve_root(request: Request):
#     """Serve the main index.html page"""
#     try:
#         template = templates_env.get_template("index.html")
#         print("template", template)
#         rendered_html = template.render(
#             api_url=os.getenv("API_BASE_URL", "https://sigopsmetrics-api-dev.dot.ga.gov"),
#             feature_flag=os.getenv("FEATURE_FLAG", "false")
#         )
#         return HTMLResponse(content=rendered_html, media_type="text/html")
#     except Exception as e:
#         return HTMLResponse(content=f"Template error: {str(e)}", status_code=500)

@router.get("/", include_in_schema=False)
@router.get("/{full_path:path}", include_in_schema=False)
async def serve_frontend(_request: Request, full_path: str):
    """Serve frontend routes (SPA fallback to index.html)"""
    # Check if it's a request for a specific file (has file extension)
    if "." in full_path:
        # Try to serve the actual file
        file_path = frontend_dist_path / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        raise HTTPException(status_code=404, detail="File not found")
    # For routes without file extensions, serve index.html (SPA routing)
    try:
        template = templates_env.get_template("index.html")
        rendered_html = template.render(
            env=ENV,
            api_base_url=API_BASE_URL
        )
        return HTMLResponse(content=rendered_html, media_type="text/html")
    except TemplateNotFound:
        return HTMLResponse(content="Template file not found", status_code=500)
    except TemplateSyntaxError as e:
        return HTMLResponse(content=f"Template syntax error: {str(e)}", status_code=500)
    except UndefinedError as e:
        return HTMLResponse(content=f"Template variable error: {str(e)}", status_code=500)
