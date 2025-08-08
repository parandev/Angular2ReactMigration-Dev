"""
SOMATA-UI Main Application Entry Point

This module serves as the main entry point for the SOMATA-UI FastAPI application.
"""

import os
import sys
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI

import middleware
from routes.routes import router

def create_app():
    """ Create the app and read in configs and setup routes from routers """
    thisapp = FastAPI()

    # set debugging state
    envdebug: str = os.getenv("DEBUG", "False")
    thisapp.state.debugging = (envdebug and envdebug.lower() == 'true')

    # Setup middleware
    middleware.add_middlewares(thisapp)

    thisapp.include_router(router)

    return thisapp


app = create_app()


if __name__ == "__main__":
    sys.path.append(os.path.dirname(os.path.realpath(__file__)))
    load_dotenv()
    envdebug: str = os.getenv("DEBUG", "False")
    reload: bool = True if envdebug and envdebug.lower() == 'true' else False
    listen_port: int = int(os.getenv("LISTEN_PORT", "8000"))
    listen_ip: str = os.getenv("LISTEN_IP", "0.0.0.0")
    appname: str = os.path.splitext(os.path.basename(__file__))[0]
    # worker threads should not exceed CPUs available to it.
    try:
        workers = len(os.sched_getaffinity(0))
    except AttributeError:
        # macOS doesn't have sched_getaffinity, use cpu_count instead
        import multiprocessing
        workers: int = multiprocessing.cpu_count()
    uvicorn.run(
        f"{appname}:app",
        host=listen_ip,
        port=listen_port,
        reload=reload,
        server_header=False,
        proxy_headers=True,
        workers=workers,
        # log_config='logging.ini'
    )
