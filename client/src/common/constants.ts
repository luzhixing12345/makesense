// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as path from 'path';

export const EXTENSION_ROOT_DIR = path.dirname(path.dirname(path.dirname(__dirname)));
export const SERVER_SCRIPT_PATH = path.join(EXTENSION_ROOT_DIR, 'server', `server.py`);
export const DEBUG_SERVER_SCRIPT_PATH = path.join(EXTENSION_ROOT_DIR, 'server', `server.py`);
export const PYTHON_MAJOR = 3;
export const PYTHON_MINOR = 8;
export const PYTHON_VERSION = `${PYTHON_MAJOR}.${PYTHON_MINOR}`;
