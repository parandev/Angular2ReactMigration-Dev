#!/usr/bin/env python3
# -*- coding: utf-8 -*-

#############################################################################
# Copyright 2023-present GDOT (Georgia Department of Transportation)
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#
# 1. Redistributions of source code must retain the above copyright notice,
#    this list of conditions and the following disclaimer.
#
# 2. Redistributions in binary form must reproduce the above copyright notice,
#    this list of conditions and the following disclaimer in the documentation
#    and/or other materials provided with the distribution.
#
# 3. Neither the name of the copyright holder nor the names of its contributors
#    may be used to endorse or promote products derived from this software
#    without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS”
# AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
# IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
# ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
# LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
# CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
# SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
# INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
# CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
# ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
# THE POSSIBILITY OF SUCH DAMAGE.
#############################################################################

""" middleware/__init__.py - Middleware configurations """

import secrets
import string

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.gzip import GZipMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

def gen_random_string(length: int = 32) -> str:
    """ Generate a random string of letters and digits """
    alphaet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphaet) for _ in range(length))


class CustomHeaderMiddleware(BaseHTTPMiddleware): # pylint: disable=too-few-public-methods
    """ Custom Header Middleware """
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Access-Control-Allow-Methods'] = 'HEAD, GET, PATCH, PUT, POST, DELETE, OPTIONS'
        response.headers['Cache-Control'] = 'no-cache'
        response.headers['Referrer-Policy'] ='same-origin'
        response.headers['Permissions-Policy'] = 'geolocation=(self)'
        # One or many of these headers below cause issues.  Will need further investigation.
        # Content Security Policies.  Modify as needed.
        cdn_domains = "*.googleapis.com *.gstatic.com cdn.jsdelivr.net fastapi.tiangolo.com"
        inline = "'self' 'unsafe-inline'" # need to fix unsafe-inline
        default_src = f"default-src {inline};"
        frame_ancestors = "frame-ancestors 'none';"
        form_action = "form-action 'self';"
        style_src = f"style-src {inline};"
        style_src_elem = f"style-src-elem {inline} data: {cdn_domains};"
        script_src = f"script-src * {inline} 'unsafe-eval' blob: data:;"
        font_src = f"font-src 'self' data: {cdn_domains};"
        img_src = f"img-src 'self' data: {cdn_domains};"
        csp = f"{default_src}{frame_ancestors}{form_action}{style_src}{style_src_elem}{script_src}{font_src}{img_src}"
        if request.app.state.debugging:
            response.headers['Content-Security-Policy-Report-Only'] = csp
            # response.headers['Content-Security-Policy'] = csp
        else:
            response.headers['Content-Security-Policy'] = csp
        # logger.debug("Response Headers: %s", response.headers)
        return response


def add_middlewares(thisapp: FastAPI) -> None:
    """ Add all the Middlewares """
    secret_key = gen_random_string(32)
    thisapp.add_middleware(
        SessionMiddleware,
        secret_key=secret_key,
        https_only=True,
        same_site='Strict',
        max_age=43200
    )

    origins = [
        'https://*.googleapis.com',
        'https://*.gstatic.com',
        'https://*.dot.ga.gov'
        'https://login.microsoft.com'
    ]

    thisapp.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        # allow_origins=['*'],
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*'],
    )

    thisapp.add_middleware(
        GZipMiddleware,
        minimum_size=500
    )

    thisapp.add_middleware(CustomHeaderMiddleware)
